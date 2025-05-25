import { UserWithRole } from 'src/auth/models/user.model';

/**
 * sanitize user fields
 * @param userField
 * @param strong
 * @constructor
 */
export const SanitizeUser = (userField?: string, strong = true) => {
  return (
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<any>
  ): TypedPropertyDescriptor<any> => {
    const decoratedFn = descriptor.value;
    async function newFunction(...args) {
      const data: any = await decoratedFn.apply(this, args);
      const user: UserWithRole = userField ? data[userField] : data;
      if (user) {
        delete (user as any).password;
        delete (user as any).salt;
        if (strong) {
          delete (user as any).token;
        }
      }
      return data;
    }
    return {
      value: newFunction
    };
  };
};

/**
 * sanitize array of users
 * @param userField
 * @constructor
 */
export const SanitizeUsers = (userField?: string) => {
  return (
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<any>
  ): TypedPropertyDescriptor<any> => {
    const decoratedFn = descriptor.value;

    async function newFunction(...args) {
      const entities: any[] = await decoratedFn.apply(this, args);
      return entities.map((entity) => {
        const user: UserWithRole = userField ? entity[userField] : entity;
        if (user) {
          delete (user as any).password;
          delete (user as any).salt;
          delete (user as any).token;
        }
        return entity;
      });
    }
    return {
      value: newFunction
    };
  };
};
