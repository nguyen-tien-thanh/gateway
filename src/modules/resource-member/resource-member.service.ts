import { Injectable } from '@nestjs/common';
import {
  CreateResourceMemberDto,
  UpdateResourceMemberDto
} from './resource-member.dto';
import {
  RabbitMQService,
  RMQRequest
} from 'src/shared/rabbitmq/rabbitmq.service';
import { IFilter } from 'src/common/decorators/filter.decorator';
import { RESOURCE_MEMBER_PATTERN } from './resource-member.pattern';

@Injectable()
export class ResourceMemberService {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async create(createResourceMemberDto: CreateResourceMemberDto) {
    const request: RMQRequest = {
      pattern: RESOURCE_MEMBER_PATTERN.CREATE,
      payload: createResourceMemberDto
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async findAll(filter?: IFilter) {
    const request: RMQRequest = {
      pattern: RESOURCE_MEMBER_PATTERN.FIND_ALL,
      filter
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async findOne(id: number) {
    const request: RMQRequest = {
      pattern: RESOURCE_MEMBER_PATTERN.FIND_ONE,
      id
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async update(id: number, updateResourceMemberDto: UpdateResourceMemberDto) {
    const request: RMQRequest = {
      pattern: RESOURCE_MEMBER_PATTERN.UPDATE,
      id,
      payload: updateResourceMemberDto
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async remove(id: number) {
    const request: RMQRequest = {
      pattern: RESOURCE_MEMBER_PATTERN.REMOVE,
      id
    };
    return await this.rabbitMQService.sendRequest(request);
  }
}
