import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { Role } from '@prisma/client';

@Injectable()
export class NotesService {
    constructor(private prisma: PrismaService) { }

    async create(createNoteDto: CreateNoteDto, userId: string, userRole: Role) {
        const lead = await this.prisma.lead.findUnique({
            where: { id: createNoteDto.leadId },
        });

        if (!lead) throw new Error('Lead not found');

        // RBAC: Salesperson can only add notes to their own leads
        if (userRole === Role.SALESPERSON && lead.assignedToId !== userId) {
            throw new ForbiddenException('You can only add notes to your assigned leads');
        }

        return this.prisma.note.create({
            data: {
                content: createNoteDto.content,
                leadId: createNoteDto.leadId,
                createdById: userId,
            },
        });
    }

    async findByLead(leadId: string) {
        return this.prisma.note.findMany({
            where: { leadId },
            include: {
                createdBy: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}
