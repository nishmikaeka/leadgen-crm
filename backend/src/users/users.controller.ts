import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  //admin can create users
  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, refreshToken, ...result } = user;
    return result;
  }

  @Get('me')
  async getMe(@CurrentUser() user: any) {
    const fullUser = await this.usersService.findById(user.id);
    if (!fullUser) {
      throw new UnauthorizedException();
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, refreshToken, ...result } = fullUser;
    return result;
  }

  @Get()
  @Roles(Role.ADMIN)
  async findAll() {
    return this.usersService.findAll();
  }
}
