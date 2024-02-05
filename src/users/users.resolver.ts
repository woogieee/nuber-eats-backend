import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verify-email.dto';
import { Role } from 'src/auth/role.decorator';
import { CreateUserGPSInput, CreateUserGPSOutput } from './dtos/create-gps.dto';
import { EditUserGPSInput, EditUserGPSOutput } from './dtos/edit-gps.dto';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  // 회원가입
  @Mutation(() => CreateAccountOutput)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    return this.usersService.createAccount(createAccountInput);
  }

  // 로그인
  @Mutation(() => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    return this.usersService.login(loginInput);
  }

  // token으로 유저 확인
  @Query(() => User)
  @Role(['Any'])
  // decorator는 value를 return
  me(@AuthUser() authUser: User) {
    return authUser;
  }

  // user profile 조회 query
  @Query(() => UserProfileOutput)
  @Role(['Any'])
  async userProfile(
    @Args() userProfileInput: UserProfileInput,
  ): Promise<UserProfileOutput> {
    return this.usersService.findById(userProfileInput.userId);
  }

  // user profile 수정
  @Mutation(() => EditProfileOutput)
  @Role(['Any'])
  async editProfile(
    @AuthUser() authUser: User,
    @Args('input') editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    return this.usersService.editProfile(authUser.id, editProfileInput);
  }

  // user verify
  @Mutation(() => VerifyEmailOutput)
  async verifyEmail(
    @Args('input') { code }: VerifyEmailInput,
  ): Promise<VerifyEmailOutput> {
    return this.usersService.verifyEmail(code);
  }

  // 유저 GPS 정보 저장
  @Mutation(() => CreateUserGPSOutput)
  @Role(['Client'])
  async userGPS(
    @Args('input') createUserGPSInput: CreateUserGPSInput,
  ): Promise<CreateUserGPSOutput> {
    return this.usersService.userGPS(createUserGPSInput);
  }

  // 유저 GPS 정보 업데이트 뮤테이션
  @Mutation(() => EditUserGPSOutput)
  @Role(['Client'])
  async editUserGPS(
    @Args('input') editUserGPSInput: EditUserGPSInput,
  ): Promise<EditUserGPSOutput> {
    return this.usersService.editUserGPS(editUserGPSInput);
  }
}
