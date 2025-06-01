import { Injectable } from '@nestjs/common';
import { CreateHouseDto, UpdateHouseDto } from './house.dto';
import {
  RabbitMQService,
  RMQRequest
} from 'src/shared/rabbitmq/rabbitmq.service';
import { IFilter } from 'src/common/decorators/filter.decorator';

@Injectable()
export class HouseService {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async create(createHouseDto: CreateHouseDto) {
    const request: RMQRequest = {
      pattern: 'house.create',
      data: createHouseDto
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async findAll(filter?: IFilter) {
    const request: RMQRequest = {
      pattern: 'house.findAll',
      data: { filter }
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async findOne(id: number) {
    const request: RMQRequest = {
      pattern: 'house.findOne',
      data: { id }
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async update(id: number, updateHouseDto: UpdateHouseDto) {
    const request: RMQRequest = {
      pattern: 'house.update',
      data: {
        id,
        ...updateHouseDto
      }
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async remove(id: number) {
    const request: RMQRequest = {
      pattern: 'house.remove',
      data: { id }
    };
    return await this.rabbitMQService.sendRequest(request);
  }
}
