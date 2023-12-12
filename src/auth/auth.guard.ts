import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AllowedRoles } from './role.decorator';
import { JwtService } from 'src/jwt/jwt.service';
import { UsersService } from 'src/users/users.service';

// guard는 function임
// request를 다음 단계로 진행할지 말지 결정
@Injectable()
// canActivate = true를 return하면 request를 진행시키고 false면 request를 멈춤
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext) {
    // metadata가 설정되어 있으면 userRole을 체크하고 설정되어 있지 않으면 확인하지 않음.
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );
    // canActivate함수: true를 리턴하면 계속 진행
    if (!roles) {
      return true;
    }
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const token = gqlContext.token;
    if (token) {
      const decoded = this.jwtService.verify(token.toString());
      console.log(gqlContext.token);
      // const user: User = gqlContext['user'];
      if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
        // db에서 해당 id를 가진 user를 찾음
        const { user } = await this.usersService.findById(decoded['id']);
        if (user) {
          // guard가 user를 graphQL context에 추가
          gqlContext['user'] = user;
          // metadata 있고, 로그인된 유저 있고, any도 있으면, 모든 사람이접근 가능
          if (roles.includes('Any')) {
            return true;
          }
        }
        return roles.includes(user.role);
      } else {
        // 토큰에 문제가 있으면 false
        return false;
      }
    } else {
      return false;
    }
  }
}
