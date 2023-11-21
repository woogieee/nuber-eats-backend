import { InputType, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { User } from '../entities/user.entity';

@ObjectType()
export class EditProfileOutput extends CoreOutput {}

@InputType()
export class EditProfileInput extends PartialType(
  // user에서 email, password를 가지고 class를 만들고
  // partialType을 이용해서 optional하게 만듦
  PickType(User, ['email', 'password']),
) {}
