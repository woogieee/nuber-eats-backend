import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

// guard는 function임
// request를 다음 단계로 진행할지 말지 결정
@Injectable()
// canActivate = true를 return하면 request를 진행시키고 false면 request를 멈춤
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    // HTTP Request를 ghaphql로 바꾸기
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext['user'];
    if (!user) {
      return false;
    }
    return true;
  }
}
