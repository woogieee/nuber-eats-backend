import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/users/entities/user.entity';
/**
 * metadata 설정하기
 * metadata는 resolver의 extra data
 */
export type AllowedRoles = keyof typeof UserRole | 'Any';

export const Role = (roles: AllowedRoles[]) => SetMetadata('roles', roles);
