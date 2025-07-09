import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import {
  CreateTranscriptionDto,
  UpdateTranscriptionDto
} from './transcription.dto';
import { IFilter } from 'src/common/decorators/filter.decorator';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Pagination } from 'src/shared/paginate/pagination';
import { ExceptionTitleList } from 'src/common/constants/exception-title-list.constants';

@Injectable()
export class TranscriptionService {
  constructor(private readonly prismaService: PrismaService) {}

  async count(filter: IFilter) {
    const res = await this.prismaService.transcription.count({
      where: filter.where
    });

    return { results: res };
  }

  async create(createTranscriptionDto: CreateTranscriptionDto) {
    const existed = await this.prismaService.transcription.findFirst({
      where: { callId: createTranscriptionDto.callId }
    });
    if (existed) throw new ConflictException(ExceptionTitleList.Conflict);

    const res = await this.prismaService.transcription.create({
      data: createTranscriptionDto
    });
    return res;
  }

  async findAll(filter: IFilter) {
    const { take = 10, skip = 0, where } = filter;

    const [transcriptions, total] = await Promise.all([
      this.prismaService.transcription.findMany({
        orderBy: { id: 'desc' },
        include: {
          call: true
        },
        ...filter
      }),
      this.prismaService.transcription.count({ where })
    ]);

    return new Pagination({
      results: transcriptions,
      currentPage: skip,
      pageSize: take,
      totalItems: total,
      next: skip < Math.ceil(total / take) ? skip + 1 : null,
      previous: skip > 1 ? skip - 1 : null
    });
  }

  async findOne(id: number) {
    const res = await this.prismaService.transcription.findUnique({
      where: { id },
      include: {
        call: true
      }
    });
    if (!res) throw new NotFoundException(ExceptionTitleList.NotFound);
    return res;
  }

  async findByCallId(callId: number) {
    const res = await this.prismaService.transcription.findUnique({
      where: { callId },
      include: {
        call: true
      }
    });
    if (!res) throw new NotFoundException(ExceptionTitleList.NotFound);
    return res;
  }

  async update(id: number, updateTranscriptionDto: UpdateTranscriptionDto) {
    const existed = await this.prismaService.transcription.findFirst({
      where: { id }
    });
    if (!existed) throw new NotFoundException(ExceptionTitleList.NotFound);

    // Check for callId conflicts if callId is being updated
    if (updateTranscriptionDto.callId) {
      const callIdExists = await this.prismaService.transcription.findFirst({
        where: { callId: updateTranscriptionDto.callId, NOT: { id } }
      });
      if (callIdExists)
        throw new ConflictException(ExceptionTitleList.Conflict);
    }

    const res = await this.prismaService.transcription.update({
      where: { id },
      data: updateTranscriptionDto
    });
    return res;
  }

  async remove(id: number) {
    const existed = await this.prismaService.transcription.findFirst({
      where: { id }
    });
    if (!existed) throw new NotFoundException(ExceptionTitleList.NotFound);

    const res = await this.prismaService.transcription.delete({
      where: { id }
    });
    return res;
  }
}
