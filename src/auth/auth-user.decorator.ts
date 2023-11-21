import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const AuthUser = createParamDecorator(
  // context를 가져다가 graphql context로 가져와 바꿈
  (data: unknown, context: ExecutionContext) => {
    const gqlContext = GqlExecutionContext.create(context).getContext();
    // graphql context에서 user를 가져오면 user를 리턴
    const user = gqlContext['user'];
    return user;
  },
);
