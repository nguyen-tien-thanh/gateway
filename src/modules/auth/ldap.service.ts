import { Injectable, Logger } from '@nestjs/common';
import { authenticate } from 'ldap-authentication';

export interface LdapConfig {
  url: string;
  baseDN: string;
  adminDn: string;
  adminPassword: string;
  usernameAttribute: string;
  timeout?: number;
  connectTimeout?: number;
}

export interface LdapUser {
  dn: string;
  cn?: string;
  sn?: string;
  givenName?: string;
  mail?: string;
  uid?: string;
  sAMAccountName?: string;
  userPrincipalName?: string;
  memberOf?: string[];
}

@Injectable()
export class LdapService {
  private readonly logger = new Logger(LdapService.name);

  /**
   * Authenticate user against LDAP server
   * @param email - Email/username to authenticate
   * @param password - Password to authenticate
   * @param config - LDAP configuration
   * @returns LdapUser if authentication successful, null otherwise
   */
  async authenticate(
    email: string,
    password: string,
    config: LdapConfig
  ): Promise<LdapUser | null> {
    try {
      const options = {
        ldapOpts: {
          url: config.url,
          timeout: config.timeout || 5000000,
          connectTimeout: config.connectTimeout || 5000000
        },
        adminDn: config.adminDn,
        adminPassword: config.adminPassword,
        userSearchBase: config.baseDN,
        usernameAttribute: config.usernameAttribute,
        username: email,
        userPassword: password
      };

      const user = await authenticate(options);

      if (user) {
        this.logger.log(`LDAP authentication successful for user: ${email}`);
        return user as LdapUser;
      }

      this.logger.warn(`LDAP authentication failed for user: ${email}`);
      return null;
    } catch (error) {
      this.logger.error(`LDAP authentication error for user ${email}:`, error);
      return null;
    }
  }

  /**
   * Search for user in LDAP directory
   * @param email - Email/username to search for
   * @param config - LDAP configuration
   * @returns LdapUser if found, null otherwise
   */
  async searchUser(
    email: string,
    config: LdapConfig
  ): Promise<LdapUser | null> {
    try {
      const options = {
        ldapOpts: {
          url: config.url,
          timeout: config.timeout || 5000000,
          connectTimeout: config.connectTimeout || 5000000
        },
        adminDn: config.adminDn,
        adminPassword: config.adminPassword,
        userSearchBase: config.baseDN,
        usernameAttribute: config.usernameAttribute,
        username: email,
        userPassword: config.adminPassword // Use admin password for search
      };

      const user = await authenticate(options);

      if (user) {
        this.logger.log(`LDAP user found: ${email}`);
        return user as LdapUser;
      }

      this.logger.warn(`LDAP user not found: ${email}`);
      return null;
    } catch (error) {
      this.logger.error(`LDAP search error for user ${email}:`, error);
      return null;
    }
  }

  /**
   * Get LDAP configuration from environment variables
   * @returns LdapConfig object
   */
  getLdapConfig(): LdapConfig {
    return {
      url: process.env.LDAP_SERVER || 'ldap://localhost:389',
      baseDN: process.env.LDAP_SEARCH_BASE || 'dc=example,dc=com',
      adminDn: process.env.LDAP_APP_DN || 'cn=admin,dc=example,dc=com',
      adminPassword: process.env.LDAP_APP_PASSWORD || '',
      usernameAttribute: process.env.LDAP_ATTRIBUTE_FOR_MAIL || 'uid',
      timeout: 5000000,
      connectTimeout: 5000000
    };
  }
}
