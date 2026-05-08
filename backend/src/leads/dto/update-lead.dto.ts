import { PartialType } from '@nestjs/mapped-types';
import { CreateLeadDto } from './create-lead.dto';
import { IsOptional, IsEnum, IsNumber, Min, IsString } from 'class-validator';
import { LeadStatus } from '@prisma/client';

export class UpdateLeadDto extends PartialType(CreateLeadDto) {
    @IsOptional()
    @IsEnum(LeadStatus)
    status?: LeadStatus;

    @IsOptional()
    @IsString()
    assignedToId?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    dealValue?: number;
}
