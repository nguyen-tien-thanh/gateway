import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { CreateQueueDto, UpdateQueueDto } from './queue.dto';
import { IFilter } from 'src/common/decorators/filter.decorator';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Pagination } from 'src/shared/paginate/pagination';
import { ExceptionTitleList } from 'src/common/constants/exception-title-list.constants';

@Injectable()
export class QueueService {
  constructor(private readonly prismaService: PrismaService) {}

  async count(filter: IFilter) {
    const res = await this.prismaService.queue.count({
      where: filter.where
    });

    return { results: res };
  }

  async create(createQueueDto: CreateQueueDto) {
    const existed = await this.prismaService.queue.findFirst({
      where: { callId: createQueueDto.callId }
    });
    if (existed) throw new ConflictException(ExceptionTitleList.Conflict);

    const res = await this.prismaService.queue.create({ data: createQueueDto });
    return res;
  }

  async findAll(filter: IFilter) {
    const { take = 10, skip = 0, where } = filter;

    const [queues, total] = await Promise.all([
      this.prismaService.queue.findMany({
        orderBy: { updatedDate: 'desc' },
        include: {
          call: true,
          user: true
        },
        ...filter
      }),
      this.prismaService.queue.count({ where })
    ]);

    return new Pagination({
      results: queues,
      currentPage: skip,
      pageSize: take,
      totalItems: total,
      next: skip < Math.ceil(total / take) ? skip + 1 : null,
      previous: skip > 1 ? skip - 1 : null
    });
  }

  async findOne(id: number) {
    const res = await this.prismaService.queue.findUnique({
      where: { id },
      include: {
        call: true,
        user: true
      }
    });
    if (!res) throw new NotFoundException(ExceptionTitleList.NotFound);
    return res;
  }

  async findByCallId(callId: number) {
    const res = await this.prismaService.queue.findUnique({
      where: { callId },
      include: {
        call: true,
        user: true
      }
    });
    if (!res) throw new NotFoundException(ExceptionTitleList.NotFound);
    return res;
  }

  async update(id: number, updateQueueDto: UpdateQueueDto) {
    const existed = await this.prismaService.queue.findFirst({ where: { id } });
    if (!existed) throw new NotFoundException(ExceptionTitleList.NotFound);

    // Check for callId conflicts if callId is being updated
    if (updateQueueDto.callId) {
      const callIdExists = await this.prismaService.queue.findFirst({
        where: { callId: updateQueueDto.callId, NOT: { id } }
      });
      if (callIdExists)
        throw new ConflictException(ExceptionTitleList.Conflict);
    }

    const res = await this.prismaService.queue.update({
      where: { id },
      data: updateQueueDto
    });
    return res;
  }

  async remove(id: number) {
    const existed = await this.prismaService.queue.findFirst({ where: { id } });
    if (!existed) throw new NotFoundException(ExceptionTitleList.NotFound);

    const res = await this.prismaService.queue.delete({ where: { id } });
    return res;
  }
}
