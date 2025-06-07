import { Injectable } from '@nestjs/common';
import { CreateRoomDto, UpdateRoomDto } from './room.dto';
import {
  RabbitMQService,
  RMQRequest
} from 'src/shared/rabbitmq/rabbitmq.service';
import { IFilter } from 'src/common/decorators/filter.decorator';
import { ROOM_PATTERN } from './room.pattern';

@Injectable()
export class RoomService {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async create(createRoomDto: CreateRoomDto) {
    const request: RMQRequest = {
      pattern: ROOM_PATTERN.CREATE,
      payload: createRoomDto
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async findAll(filter?: IFilter) {
    const request: RMQRequest = {
      pattern: ROOM_PATTERN.FIND_ALL,
      filter
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async findOne(id: number) {
    const request: RMQRequest = {
      pattern: ROOM_PATTERN.FIND_ONE,
      id
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async update(id: number, updateRoomDto: UpdateRoomDto) {
    const request: RMQRequest = {
      pattern: ROOM_PATTERN.UPDATE,
      id,
      payload: updateRoomDto
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async remove(id: number) {
    const request: RMQRequest = {
      pattern: ROOM_PATTERN.DELETE,
      id
    };
    return await this.rabbitMQService.sendRequest(request);
  }
}
