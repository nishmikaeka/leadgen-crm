import { IsEmail, IsNotEmpty, IsEnum, IsOptional, IsNumber, Min, Matches } from 'class-validator';
import { LeadSource, LeadStatus } from '@prisma/client';

export class CreateLeadDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    company: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @Matches(/^(?:\+94|0)?(?:7[01245678]|11|2[134567]|3[1234578]|4[157]|5[12457]|6[3567]|81|91)[0-9]{7}$/, {
        message: 'Invalid Sri Lankan phone number format',
    })
    phone: string;

    @IsEnum(LeadSource)
    source: LeadSource;

    @IsOptional()
    assignedToId?: string;

    @IsEnum(LeadStatus)
    @IsOptional()
    status?: LeadStatus;

    @IsNumber()
    @Min(0)
    @IsOptional()
    dealValue?: number;
}
