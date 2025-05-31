import { Injectable } from '@nestjs/common';
import { ValidatorConstraint } from 'class-validator';
import { PrismaService } from 'src/prisma/prisma.service';

import { AbstractUniqueValidator } from 'src/common/pipes/abstract-unique-validator';

/**
 * unique validator pipe
 */
@ValidatorConstraint({
  name: 'unique',
  async: true
})
@Injectable()
export class UniqueValidatorPipe extends AbstractUniqueValidator {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}
