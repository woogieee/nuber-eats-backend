import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from './jwt.service';
import { UsersService } from 'src/users/users.service';

// http 기술을 쓰기위해서 만듦
@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    // dependency injection
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    // headers에서 token 추출
    if ('x-jwt' in req.headers) {
      const token = req.headers['x-jwt'];
      try {
        const decoded = this.jwtService.verify(token.toString());
        // 토큰에서 id를 찾음
        if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
          // db에서 해당 id를 가진 user를 찾음
          const user = await this.usersService.findById(decoded['id']);
          // user를 request object에 붙여서 보냄
          req['user'] = user;
        }
      } catch (e) {}
    }
    next();
  }
}

// export function jwtMiddleware(req: Request, res: Response, next: NextFunction) {
//   console.log(req.headers);
//   next();
// }
