import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadStatus, LeadSource, Prisma } from '@prisma/client';
import * as XLSX from 'xlsx';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) { }

  async create(createLeadDto: CreateLeadDto, currentUserId: string) {
    const status = createLeadDto.status || LeadStatus.NEW;
    const assignedToId = createLeadDto.assignedToId || currentUserId;

    return this.prisma.lead.create({
      data: {
        ...createLeadDto,
        status,
        assignedToId,
        dealValue: createLeadDto.dealValue ?? 0,
      },
    });
  }

  async findAll(
    filters: {
      status?: LeadStatus;
      source?: LeadSource;
      assignedToId?: string;
      search?: string;
    },
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;
    const { search, ...otherFilters } = filters;

    const where: Prisma.LeadWhereInput = {
      ...otherFilters,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { assignedTo: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        notes: {
          include: {
            createdBy: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        statusChangeHistory: {
          include: {
            changedBy: { select: { id: true, name: true } },
          },
          orderBy: { changedAt: 'desc' },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!lead) throw new NotFoundException(`Lead with ID ${id} not found`);
    return lead;
  }

  async update(id: string, updateLeadDto: UpdateLeadDto, userId: string) {
    const currentLead = await this.findOne(id);

    if (updateLeadDto.status && updateLeadDto.status !== currentLead.status) {
      await this.prisma.leadStatusHistory.create({
        data: {
          leadId: id,
          fromStatus: currentLead.status,
          toStatus: updateLeadDto.status,
          changedById: userId,
        },
      });
    }

    return this.prisma.lead.update({
      where: { id },
      data: updateLeadDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.lead.delete({
      where: { id },
    });
  }

  //adding the bulk data to leads table
  async bulkImport(
    buffer: Buffer,
    currentUserId: string,
    assignedUserIds?: string[],
  ) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    // Shuffle the distribution pool if there are multiple users for fair "residue" distribution
    const distributionPool =
      assignedUserIds && assignedUserIds.length > 0
        ? [...assignedUserIds].sort(() => Math.random() - 0.5)
        : [currentUserId];

    const poolSize = distributionPool.length;

    const leads = data.map((row: any, index: number) => ({
      name: String(row.Name || row.name || 'Unknown'),
      email: String(row.Email || row.email || ''),
      phone: String(row.Phone || row.phone || ''),
      company: String(row.Company || row.company || 'Unknown'),
      dealValue: Number(row['Deal Value'] || row.dealValue) || 0,
      status: LeadStatus.NEW,
      source: LeadSource.OTHER,
      assignedToId: distributionPool[index % poolSize],
    }));

    return this.prisma.lead.createMany({ data: leads });
  }
}
