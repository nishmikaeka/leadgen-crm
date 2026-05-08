import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
    Strategy,
    'jwt-refresh',
) {
    constructor() {
        const secret = process.env.JWT_REFRESH_SECRET;
        if (!secret) throw new Error('JWT_REFRESH_SECRET is not defined');

        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: any) => {
                    return (request as Request)?.cookies?.refreshToken;
                },
            ]),
            secretOrKey: secret,
            passReqToCallback: true,
        });
    }

    validate(req: Request, payload: any) {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) throw new ForbiddenException('Refresh token malformed');
        return { ...payload, refreshToken };
    }
}
