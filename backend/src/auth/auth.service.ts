import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async login(loginDto: LoginDto) {
        const user = await this.usersService.findByEmail(loginDto.email);
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

        const tokens = await this.getTokens(user.id, user.email, user.role);
        await this.updateRefreshToken(user.id, tokens.refreshToken);

        const { password, refreshToken, ...result } = user;
        return {
            user: result,
            ...tokens,
        };
    }

    async logout(userId: string) {
        await this.usersService.updateRefreshToken(userId, null);
    }

    async refreshTokens(userId: string, refreshToken: string) {
        const user = await this.usersService.findById(userId);
        if (!user || !user.refreshToken) throw new ForbiddenException('Access Denied');

        const refreshTokenMatches = await bcrypt.compare(
            refreshToken,
            user.refreshToken,
        );
        if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');

        const tokens = await this.getTokens(user.id, user.email, user.role);
        await this.updateRefreshToken(user.id, tokens.refreshToken);

        return tokens;
    }

    async updateRefreshToken(userId: string, refreshToken: string) {
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        await this.usersService.updateRefreshToken(userId, hashedRefreshToken);
    }

    async getTokens(userId: string, email: string, role: string) {
        const payload = { sub: userId, email, role };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: process.env.JWT_ACCESS_SECRET!,
                expiresIn: process.env.JWT_ACCESS_EXPIRES as any,
            }),
            this.jwtService.signAsync(payload, {
                secret: process.env.JWT_REFRESH_SECRET!,
                expiresIn: process.env.JWT_REFRESH_EXPIRES as any,
            }),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }
}
