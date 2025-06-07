import { Injectable } from '@nestjs/common';
import { CreateRoomAssetDto, UpdateRoomAssetDto } from './room-asset.dto';
import {
  RabbitMQService,
  RMQRequest
} from 'src/shared/rabbitmq/rabbitmq.service';
import { IFilter } from 'src/common/decorators/filter.decorator';
import { ROOM_ASSET_PATTERN } from './room-asset.pattern';

@Injectable()
export class RoomAssetService {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async create(createRoomAssetDto: CreateRoomAssetDto) {
    const request: RMQRequest = {
      pattern: ROOM_ASSET_PATTERN.CREATE,
      payload: createRoomAssetDto
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async findAll(filter?: IFilter) {
    const request: RMQRequest = {
      pattern: ROOM_ASSET_PATTERN.FIND_ALL,
      filter
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async findOne(id: number) {
    const request: RMQRequest = {
      pattern: ROOM_ASSET_PATTERN.FIND_ONE,
      id
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async update(id: number, updateRoomAssetDto: UpdateRoomAssetDto) {
    const request: RMQRequest = {
      pattern: ROOM_ASSET_PATTERN.UPDATE,
      id,
      payload: updateRoomAssetDto
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async remove(id: number) {
    const request: RMQRequest = {
      pattern: ROOM_ASSET_PATTERN.DELETE,
      id
    };
    return await this.rabbitMQService.sendRequest(request);
  }
}
