import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CoreEntity } from 'src/common/entities/core.entity';
import { InternalServerErrorException } from '@nestjs/common';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { UserGPS } from './user-gps.entity';

export enum UserRole {
  Client = 'Client',
  Owner = 'Owner',
  Delivery = 'Delivery',
  Admin = 'Admin',
}

registerEnumType(UserRole, { name: 'UserRole' });

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column({ unique: true })
  @Field(() => String)
  @IsEmail()
  email: string;

  @Column({ select: false })
  @Field(() => String)
  @IsString()
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @Field(() => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  // User email이 verified 됐는지 확인
  @Column({ default: false })
  @Field(() => Boolean)
  @IsBoolean()
  verified: boolean;

  @Field(() => [Restaurant])
  @OneToMany(() => Restaurant, (restaurant) => restaurant.owner)
  restaurants: Restaurant[];

  // 오더
  @Field(() => [Order])
  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];

  // 결제
  @Field(() => [Payment])
  @OneToMany(() => Payment, (payment) => payment.user, { eager: true })
  payments: Payment[];

  // 라이더
  @Field(() => [Order])
  @OneToMany(() => Order, (order) => order.driver)
  rides: Order[];

  // gps
  @OneToMany(() => UserGPS, (gps) => gps.user, { eager: true, cascade: true })
  @Field(() => [UserGPS], { nullable: true })
  @IsOptional()
  gpsList?: UserGPS[]; // 이제 옵셔널로 변경

  // DB에 비밀번호를 넣기전에 hash함
  @BeforeInsert()
  // 프로필 업데이트
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    // Update, insert에 패스워드가 있을 경우만 hash
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (e) {
        console.log(e);
        throw new InternalServerErrorException();
      }
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
