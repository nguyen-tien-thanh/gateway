import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { CreateUnitDto, UpdateUnitDto } from './unit.dto';
import { IFilter } from 'src/common/decorators/filter.decorator';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Pagination } from 'src/shared/paginate/pagination';
import { ExceptionTitleList } from 'src/common/constants/exception-title-list.constants';

@Injectable()
export class UnitService {
  constructor(private readonly prismaService: PrismaService) {}

  async count(filter: IFilter) {
    const res = await this.prismaService.unit.count({
      where: filter.where
    });

    return { results: res };
  }

  async create(createUnitDto: CreateUnitDto) {
    const existed = await this.prismaService.unit.findFirst({
      where: { title: createUnitDto.title }
    });
    if (existed) throw new ConflictException(ExceptionTitleList.Conflict);

    const res = await this.prismaService.unit.create({ data: createUnitDto });
    return res;
  }

  async findAll(filter: IFilter) {
    const { take = 10, skip = 0, where } = filter;

    const [units, total] = await Promise.all([
      this.prismaService.unit.findMany({
        orderBy: { id: 'desc' },
        ...filter
      }),
      this.prismaService.unit.count({ where })
    ]);

    return new Pagination({
      results: units,
      currentPage: skip,
      pageSize: take,
      totalItems: total,
      next: skip < Math.ceil(total / take) ? skip + 1 : null,
      previous: skip > 1 ? skip - 1 : null
    });
  }

  async findOne(id: number) {
    const res = await this.prismaService.unit.findUnique({
      where: { id }
    });
    if (!res) throw new NotFoundException(ExceptionTitleList.NotFound);
    return res;
  }

  async update(id: number, updateUnitDto: UpdateUnitDto) {
    const existed = await this.prismaService.unit.findFirst({ where: { id } });
    if (!existed) throw new NotFoundException(ExceptionTitleList.NotFound);

    // Check for title conflicts if title is being updated
    if (updateUnitDto.title) {
      const titleExists = await this.prismaService.unit.findFirst({
        where: { title: updateUnitDto.title, NOT: { id } }
      });
      if (titleExists) throw new ConflictException(ExceptionTitleList.Conflict);
    }

    const res = await this.prismaService.unit.update({
      where: { id },
      data: updateUnitDto
    });
    return res;
  }

  async remove(id: number) {
    const existed = await this.prismaService.unit.findFirst({ where: { id } });
    if (!existed) throw new NotFoundException(ExceptionTitleList.NotFound);

    const res = await this.prismaService.unit.delete({ where: { id } });
    return res;
  }
}
