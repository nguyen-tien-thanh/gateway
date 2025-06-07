import { Injectable } from '@nestjs/common';
import { CreateMaintenanceDto, UpdateMaintenanceDto } from './maintenance.dto';
import {
  RabbitMQService,
  RMQRequest
} from 'src/shared/rabbitmq/rabbitmq.service';
import { IFilter } from 'src/common/decorators/filter.decorator';
import { MAINTENANCE_PATTERN } from './maintenance.pattern';

@Injectable()
export class MaintenanceService {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async create(createMaintenanceDto: CreateMaintenanceDto) {
    const request: RMQRequest = {
      pattern: MAINTENANCE_PATTERN.CREATE,
      payload: createMaintenanceDto
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async findAll(filter?: IFilter) {
    const request: RMQRequest = {
      pattern: MAINTENANCE_PATTERN.FIND_ALL,
      filter
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async findOne(id: number) {
    const request: RMQRequest = {
      pattern: MAINTENANCE_PATTERN.FIND_ONE,
      id
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async update(id: number, updateMaintenanceDto: UpdateMaintenanceDto) {
    const request: RMQRequest = {
      pattern: MAINTENANCE_PATTERN.UPDATE,
      id,
      payload: updateMaintenanceDto
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async remove(id: number) {
    const request: RMQRequest = {
      pattern: MAINTENANCE_PATTERN.DELETE,
      id
    };
    return await this.rabbitMQService.sendRequest(request);
  }
}
