import { IsLowercase, IsNotEmpty, IsBoolean } from 'class-validator';

/**
 * LDAP login data transfer object
 */
export class LdapLoginDto {
  @IsNotEmpty()
  @IsLowercase()
  username: string;

  @IsNotEmpty()
  password: string;

  @IsBoolean()
  remember: boolean;
}
