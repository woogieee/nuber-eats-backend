import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { BeforeInsert, Column, Entity } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CoreEntity } from 'src/common/entities/core.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { IsEmail, IsEnum } from 'class-validator';

enum UserRole {
  Client,
  Owner,
  Delivery,
}

registerEnumType(UserRole, { name: 'UserRole' });

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column()
  @Field(() => String)
  @IsEmail()
  email: string;

  @Column()
  @Field(() => String)
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @Field(() => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  // DB에 비밀번호를 넣기전에 hash함
  @BeforeInsert()
  async hashPassword(): Promise<void> {
    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  // 로그인 비밀번호 체크
  async checkPassword(aPassword: string): Promise<boolean> {
    try {
      const ok = await bcrypt.compare(aPassword, this.password);
      return ok;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }
}
