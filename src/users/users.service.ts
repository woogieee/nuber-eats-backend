import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CreateAccountInput } from './dtos/create-account.dto';
import { LoginInput } from './dtos/login.dto';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    private readonly jwtService: JwtService,
  ) {}

  // 회원가입
  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<{ ok: boolean; error?: string }> {
    try {
      // check new user
      const exists = await this.users.findOne({ where: { email } });
      if (exists) {
        return { ok: false, error: 'There is a user with that email already' };
      }
      // create user
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      await this.verifications.save(
        this.verifications.create({
          user,
        }),
      );
      return { ok: true };
    } catch (e) {
      // make error
      return { ok: false, error: `Couldn't create account` };
    }
  }

  // 로그인
  async login({
    email,
    password,
  }: LoginInput): Promise<{ ok: boolean; error?: string; token?: string }> {
    try {
      // find the user with the email
      const user = await this.users.findOne({
        where: { email },
        // TypeOrm에 명확하게 password를 select하라고 함. -> user.entity에 @Column({ select: false }) 때문
        select: ['id', 'password'],
      });
      if (!user) {
        return {
          ok: false,
          error: 'User not found',
        };
      }
      // check if the password is correct
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: 'Wrong password',
        };
      }
      // make a JWT and give it to the user
      // 이 프로젝트에서만 jwtmodule을 사용할 경우
      const token = this.jwtService.sign(user.id);

      // 다른 프로젝트에서 jwtmodule을 사용할 경우 user.id 정보만 지정
      // const token = this.jwtService.sign({ id: user.id });
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
  // 토큰으로 리턴받은 유저 id로 user를 찾는 function
  async findById(id: number): Promise<User> {
    return this.users.findOne({ where: { id } });
  }

  // 회원정보 수정
  // cookie에서 decorator가 주는 userId를 사용
  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<User> {
    // BeforeUpdate Hook을 사용하기 위해 작성함
    const user = await this.users.findOne({ where: { id: userId } });
    // email이 존재하면
    if (email) {
      user.email = email;
      user.verified = false;
      await this.verifications.save(this.verifications.create({ user }));
    }
    if (password) {
      user.password = password;
    }
    // userId에 해당하는 정보를 찾아 email, password를 update
    // update를 사용하면 password가 undefind 됨 -> save로 변경
    // update query는 entity가 있는지 체크하지 않고 db로 query만 보냄.
    return this.users.save(user);
  }

  async verifyEmail(code: string): Promise<boolean> {
    try {
      const verification = await this.verifications.findOne({
        where: { code },
        relations: ['user'],
      });
      if (verification) {
        verification.user.verified = true;
        console.log(verification.user);
        this.users.save(verification.user);
        return true;
      }
      throw new Error();
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
