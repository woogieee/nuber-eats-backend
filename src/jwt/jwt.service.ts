import { Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwtModuleOptions } from './jwt.interfaces';
import { CONFIG_OPTIONS } from './jwt.constants';

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions,
  ) {}
  // 이 프로젝트에서만 사용할 경우 userId 값만 넘겨줌
  sign(userId: number): string {
    return jwt.sign({ id: userId }, this.options.privateKey);
  }
  // 다른 프로젝트에서 JwtModule을 이용할 경우 payload가 어떤 object도 될수있기 때문에 아래처럼 사용가능
  // sign(payload: object): string {
  //   return jwt.sign(payload, this.options.privateKey);
  // }

  verify(token: string) {
    return jwt.verify(token, this.options.privateKey);
  }
}
