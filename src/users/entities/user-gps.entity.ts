// user-gps.entity.ts
import { Field, Float, InputType, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from './user.entity';

@InputType('UserGPSInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class UserGPS extends CoreEntity {
  @Field(() => Float)
  @Column({ type: 'float' })
  lat: number;

  @Field(() => Float)
  @Column({ type: 'float' })
  lng: number;

  @ManyToOne(() => User, (user) => user.gpsList, { onDelete: 'CASCADE' })
  user: User;
}
