import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards
} from '@nestjs/common';
import { QueueService } from './queue.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IFilter, Filter } from 'src/common/decorators/filter.decorator';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { JwtTwoFactorGuard } from 'src/common/guard/jwt-two-factor.guard';
import { CreateQueueDto, UpdateQueueDto } from './queue.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UserWithRole } from '../auth/models/user.model';

@ApiTags('queues')
@Controller('queues')
@ApiBearerAuth()
@UseGuards(JwtTwoFactorGuard, PermissionGuard)
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Get('count')
  count(@Filter() filter: IFilter) {
    return this.queueService.count(filter);
  }

  @Post()
  create(
    @Body() createQueueDto: CreateQueueDto,
    @GetUser() user: UserWithRole
  ) {
    return this.queueService.create({
      ...createQueueDto,
      createdBy: user.id
    });
  }

  @Get()
  findAll(@Filter() filter: IFilter) {
    return this.queueService.findAll(filter);
  }

  @Get('call/:callId')
  findByCallId(@Param('callId') callId: string) {
    return this.queueService.findByCallId(+callId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.queueService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQueueDto: UpdateQueueDto) {
    return this.queueService.update(+id, updateQueueDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.queueService.remove(+id);
  }
}
