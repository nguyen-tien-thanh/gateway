import { Injectable } from '@nestjs/common';
import { CreateHouseDto, UpdateHouseDto } from './house.dto';
import {
  RabbitMQService,
  RMQRequest
} from 'src/shared/rabbitmq/rabbitmq.service';
import { IFilter } from 'src/common/decorators/filter.decorator';
import { HOUSE_PATTERN } from './house.pattern';

@Injectable()
export class HouseService {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async create(createHouseDto: CreateHouseDto) {
    const request: RMQRequest = {
      pattern: HOUSE_PATTERN.CREATE,
      payload: createHouseDto
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async findAll(filter?: IFilter) {
    const request: RMQRequest = {
      pattern: HOUSE_PATTERN.FIND_ALL,
      filter
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async findOne(id: number) {
    const request: RMQRequest = {
      pattern: HOUSE_PATTERN.FIND_ONE,
      id
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async update(id: number, updateHouseDto: UpdateHouseDto) {
    const request: RMQRequest = {
      pattern: HOUSE_PATTERN.UPDATE,
      id,
      payload: updateHouseDto
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async remove(id: number) {
    const request: RMQRequest = {
      pattern: HOUSE_PATTERN.REMOVE,
      id
    };
    return await this.rabbitMQService.sendRequest(request);
  }
}
