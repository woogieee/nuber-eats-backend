import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { MailService } from 'src/mail/mail.service';
import { UpdateUserGPSInput, UpdateUserGPSOutput } from './dtos/update-gps.dto';
import { UserGPS } from './entities/user-gps.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(UserGPS) private readonly usersGPS: Repository<UserGPS>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  // 회원가입
  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
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
      const verification = await this.verifications.save(
        this.verifications.create({
          user,
        }),
      );
      this.mailService.sendVerificationEmail(user.email, verification.code);
      return { ok: true };
    } catch (e) {
      // make error
      console.log(e);
      return { ok: false, error: `Couldn't create account` };
    }
  }

  // 로그인
  async login({ email, password }: LoginInput): Promise<LoginOutput> {
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
        error: `Can't log user in.`,
      };
    }
  }
  // 토큰으로 리턴받은 유저 id로 user를 찾는 function
  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOneOrFail({ where: { id } });
      return {
        ok: true,
        user,
      };
    } catch (error) {
      return { ok: false, error: 'User Not Found' };
    }
  }

  // 회원정보 수정
  // cookie에서 decorator가 주는 userId를 사용
  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      // BeforeUpdate Hook을 사용하기 위해 작성함
      const user = await this.users.findOne({ where: { id: userId } });
      // email이 존재하면 userId에 해당하는 정보를 찾아 email, password를 update
      if (email) {
        user.email = email;
        user.verified = false;
        // 이메일을 수정할때 verification을 삭제함
        await this.verifications.delete({ user: { id: user.id } });
        const verification = await this.verifications.save(
          this.verifications.create({ user }),
        );
        this.mailService.sendVerificationEmail(user.email, verification.code);
      }
      if (password) {
        user.password = password;
      }
      // update를 사용하면 password가 undefind 됨 -> save로 변경
      // update query는 entity가 있는지 체크하지 않고 db로 query만 보냄.
      await this.users.save(user);
      return {
        ok: true,
      };
    } catch (error) {
      return { ok: false, error: 'Could not update profile.' };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      // 검증(verification)을 코드(code)를 기반으로 찾음
      const verification = await this.verifications.findOne({
        where: { code },
        relations: ['user'],
      });
      // 검증이 존재하면
      if (verification) {
        // 사용자를 확인(verified) 상태로 설정
        verification.user.verified = true;

        // 사용자 정보를 저장
        await this.users.save(verification.user);

        // 검증 정보 삭제
        await this.verifications.delete(verification.id);
        return { ok: true };
      }
      return { ok: false, error: 'Verification not found.' };
    } catch (error) {
      return { ok: false, error: 'Could not verify email.' };
    }
  }

  async updateUserGPS({
    lat,
    lng,
    userId,
  }: UpdateUserGPSInput): Promise<UpdateUserGPSOutput> {
    try {
      // 해당 유저의 GPS 정보를 데이터베이스에서 찾습니다.
      let userGPS = await this.usersGPS.findOne({
        where: { user: { id: userId } },
      });

      // 만약 해당 유저의 GPS 정보가 없다면
      if (!userGPS) {
        // 유저 테이블에서 해당 유저를 찾습니다.
        const user = await this.users.findOne({
          where: { id: userId },
        });

        // 새로운 GPS 정보를 생성합니다.
        userGPS = this.usersGPS.create({
          lat: lat,
          lng: lng,
          user,
        });
      } else {
        // 이미 존재하는 GPS 정보라면 업데이트합니다.
        userGPS.lat = lat;
        userGPS.lng = lng;
      }

      // 업데이트 또는 생성된 유저의 GPS 정보를 저장합니다.
      await this.usersGPS.save(userGPS);

      // 성공 여부를 나타내는 객체를 반환합니다.
      return { ok: true };
    } catch (error) {
      // 실패한 경우 에러 메시지를 포함한 객체를 반환합니다.
      return { ok: false, error: 'GPS 정보를 업데이트하는데 실패했습니다.' };
    }
  }
}
