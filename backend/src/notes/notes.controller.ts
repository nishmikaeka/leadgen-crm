import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  async create(@Body() createNoteDto: CreateNoteDto, @CurrentUser() user: any) {
    return this.notesService.create(createNoteDto, user.id, user.role);
  }

  @Get('lead/:leadId')
  async findByLead(@Param('leadId') leadId: string) {
    return this.notesService.findByLead(leadId);
  }
}
