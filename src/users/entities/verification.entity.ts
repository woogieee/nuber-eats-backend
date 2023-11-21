import { v4 as uuidv4 } from 'uuid';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
// User와 One-to-one 관계
export class Verification extends CoreEntity {
  @Column()
  @Field(() => String)
  code: string;

  // onDelete = user가 삭제 되었을때 동작
  // CASCADE는 user가 삭제되면 붙어있는 verification도 같이 삭제
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @BeforeInsert()
  createCode(): void {
    this.code = uuidv4();
  }
}
