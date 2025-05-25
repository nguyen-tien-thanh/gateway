import { User as PrismaUser, Role as PrismaRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { UserStatusEnum } from '../user-status.enum';

export interface UserWithRole extends PrismaUser {
  role?: PrismaRole;
}

export class UserModel implements PrismaUser {
  id: number;
  username: string;
  email: string;

  @Exclude({ toPlainOnly: true })
  password: string;

  name: string;
  address: string;
  contact: string;
  avatar: string;
  status: UserStatusEnum;

  @Exclude({ toPlainOnly: true })
  token: string;

  tokenValidityDate: Date;

  @Exclude({ toPlainOnly: true })
  salt: string;

  @Exclude({ toPlainOnly: true })
  twoFASecret: string | null;

  @Exclude({ toPlainOnly: true })
  twoFAThrottleTime: Date | null;

  isTwoFAEnabled: boolean;
  roleId: number;
  createdAt: Date;
  updatedAt: Date;

  // Helper method for password validation
  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }

  // Helper method for password hashing
  static async hashPassword(password: string, salt: string): Promise<string> {
    return await bcrypt.hash(password, salt);
  }
}
