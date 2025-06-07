import { Injectable } from '@nestjs/common';
import {
  CreateTenantContractDto,
  UpdateTenantContractDto
} from './tenant-contract.dto';
import {
  RabbitMQService,
  RMQRequest
} from 'src/shared/rabbitmq/rabbitmq.service';
import { IFilter } from 'src/common/decorators/filter.decorator';
import { TENANT_CONTRACT_PATTERN } from './tenant-contract.pattern';

@Injectable()
export class TenantContractService {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async create(createTenantContractDto: CreateTenantContractDto) {
    const request: RMQRequest = {
      pattern: TENANT_CONTRACT_PATTERN.CREATE,
      payload: createTenantContractDto
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async findAll(filter?: IFilter) {
    const request: RMQRequest = {
      pattern: TENANT_CONTRACT_PATTERN.FIND_ALL,
      filter
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async findOne(id: number) {
    const request: RMQRequest = {
      pattern: TENANT_CONTRACT_PATTERN.FIND_ONE,
      id
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async update(id: number, updateTenantContractDto: UpdateTenantContractDto) {
    const request: RMQRequest = {
      pattern: TENANT_CONTRACT_PATTERN.UPDATE,
      id,
      payload: updateTenantContractDto
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async remove(id: number) {
    const request: RMQRequest = {
      pattern: TENANT_CONTRACT_PATTERN.DELETE,
      id
    };
    return await this.rabbitMQService.sendRequest(request);
  }
}
