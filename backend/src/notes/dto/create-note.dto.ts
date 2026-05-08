import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateNoteDto {
    @IsNotEmpty()
    content: string;

    @IsUUID()
    @IsNotEmpty()
    leadId: string;
}
