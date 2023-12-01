import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AllowedRoles } from './role.decorator';
import { User } from 'src/users/entities/user.entity';

// guard는 function임
// request를 다음 단계로 진행할지 말지 결정
@Injectable()
// canActivate = true를 return하면 request를 진행시키고 false면 request를 멈춤
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    // metadata가 설정되어 있으면 userRole을 체크하고 설정되어 있지 않으면 확인하지 않음.
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );
    // canActivate함수: true를 리턴하면 계속 진행
    if (!roles) {
      return true;
    }
    // HTTP Request를 ghaphql로 바꾸기
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user: User = gqlContext['user'];
    // 유저 로그인 X
    if (!user) {
      return false;
    }
    // metadata 있고, 로그인된 유저 있고, any도 있으면, 모든 사람이접근 가능
    if (roles.includes('Any')) {
      return true;
    }
    return roles.includes(user.role);
  }
}
