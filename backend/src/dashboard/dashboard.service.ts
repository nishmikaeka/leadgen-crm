import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, LeadStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) { }

  async getStats(
    userId: string,
    role: Role,
    filters?: { startDate?: string; endDate?: string },
  ) {
    const where: any = {};
    if (role === Role.SALESPERSON) {
      where.assignedToId = userId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    const [
      totalLeads,
      statusCounts,
      dealValueStats,
      wonDealValue,
      sourceCounts,
    ] = await Promise.all([
      this.prisma.lead.count({ where }),
      this.prisma.lead.groupBy({
        where,
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.lead.aggregate({
        where,
        _sum: { dealValue: true },
      }),
      this.prisma.lead.aggregate({
        where: { ...where, status: LeadStatus.WON },
        _sum: { dealValue: true },
      }),
      this.prisma.lead.groupBy({
        where,
        by: ['source'],
        _count: { _all: true },
      }),
    ]);

    // Helper to find count by status
    const getCountByStatus = (status: LeadStatus) =>
      statusCounts.find((s) => s.status === status)?._count._all || 0;

    return {
      totalLeads,
      newLeads: getCountByStatus(LeadStatus.NEW),
      qualifiedLeads: getCountByStatus(LeadStatus.QUALIFIED),
      wonLeads: getCountByStatus(LeadStatus.WON),
      lostLeads: getCountByStatus(LeadStatus.LOST),
      totalEstimatedDealValue: dealValueStats._sum.dealValue || 0,
      totalValueOfWonDeals: wonDealValue._sum.dealValue || 0,
      sourceDistribution: sourceCounts.reduce((acc, curr) => {
        acc[curr.source] = curr._count._all;
        return acc;
      }, {}),
    };
  }
}
