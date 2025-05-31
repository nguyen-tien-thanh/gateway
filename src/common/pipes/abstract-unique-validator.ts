import {
  ValidationArguments,
  ValidatorConstraintInterface
} from 'class-validator';
import { PrismaService } from 'src/prisma/prisma.service';

/**
 * unique validation arguments
 */
export interface UniqueValidationArguments<E> extends ValidationArguments {
  constraints: [
    string, // model name (e.g., 'emailTemplate')
    ((validationArguments: ValidationArguments) => any) | keyof E
  ];
}

/**
 * abstract class to validate unique
 */
export abstract class AbstractUniqueValidator
  implements ValidatorConstraintInterface
{
  protected constructor(protected readonly prisma: PrismaService) {}

  /**
   * validate method to validate provided condition
   * @param value
   * @param args
   */
  public async validate<E>(value: string, args: UniqueValidationArguments<E>) {
    const [modelName, findCondition = args.property] = args.constraints;

    const whereCondition =
      typeof findCondition === 'function'
        ? findCondition(args)
        : { [findCondition || args.property]: value };

    const count = await (this.prisma as any)[modelName].count({
      where: whereCondition
    });

    return count <= 0;
  }

  /**
   * default message
   * @param args
   */
  public defaultMessage(args: ValidationArguments) {
    return `${args.property} '${args.value}' already exists`;
  }
}
