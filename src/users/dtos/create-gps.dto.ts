import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsOptional } from 'class-validator';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class CreateUserGPSInput {
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  lng?: number;

  @Field(() => Int)
  userId: number;
}

@ObjectType()
export class CreateUserGPSOutput extends CoreOutput {}
