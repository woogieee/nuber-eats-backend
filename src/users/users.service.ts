import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CreateAccountInput } from './dtos/create-account.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

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
      await this.users.save(this.users.create({ email, password, role }));
      return { ok: true };
    } catch (e) {
      // make error
      return { ok: false, error: `Couldn't create account` };
    }
  }
}
