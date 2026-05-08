import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ForbiddenException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, LeadStatus, LeadSource } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('leads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) { }

  @Post()
  async create(@Body() createLeadDto: CreateLeadDto, @CurrentUser() user: any) {
    if (user.role === Role.SALESPERSON) {
      createLeadDto.assignedToId = user.id;
    }
    return this.leadsService.create(createLeadDto, user.id);
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Query('status') status?: LeadStatus,
    @Query('source') source?: LeadSource,
    @Query('assignedToId') assignedToId?: string,
    @Query('search') search?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const filters: any = {};
    if (status) filters.status = status;
    if (source) filters.source = source;
    if (search) filters.search = search;

    if (user.role === Role.SALESPERSON) {
      filters.assignedToId = user.id;
    } else if (assignedToId) {
      filters.assignedToId = assignedToId;
    }

    return this.leadsService.findAll(filters, +page, +limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const lead = await this.leadsService.findOne(id);

    if (user.role === Role.SALESPERSON && lead.assignedToId !== user.id) {
      throw new ForbiddenException('You do not have access to this lead');
    }

    return lead;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
    @CurrentUser() user: any,
  ) {
    const lead = await this.leadsService.findOne(id);

    if (user.role === Role.SALESPERSON && lead.assignedToId !== user.id) {
      throw new ForbiddenException('You do not have access to this lead');
    }

    if (user.role === Role.SALESPERSON && updateLeadDto.assignedToId) {
      delete updateLeadDto.assignedToId;
    }

    return this.leadsService.update(id, updateLeadDto, user.id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }

  //import bulk endpoint
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importLeads(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
    @Body('assignedToIds') assignedToIds?: string | string[],
  ) {
    let userIdsToAssign: string[] = [];

    if (user.role === Role.SALESPERSON) {
      userIdsToAssign = [user.id];
    } else if (assignedToIds) {
      // Handle both string "id1,id2" and array ["id1", "id2"] sent via FormData
      if (typeof assignedToIds === 'string') {
        try {
          // It might be a JSON stringified array or a comma-separated string
          const parsed = JSON.parse(assignedToIds);
          userIdsToAssign = Array.isArray(parsed) ? parsed : [assignedToIds];
        } catch {
          userIdsToAssign = assignedToIds.split(',');
        }
      } else if (Array.isArray(assignedToIds)) {
        userIdsToAssign = assignedToIds;
      }
    }

    return this.leadsService.bulkImport(
      file.buffer,
      user.id,
      userIdsToAssign.length > 0 ? userIdsToAssign : undefined,
    );
  }
}
