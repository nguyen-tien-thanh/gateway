import { Injectable } from '@nestjs/common';
import { CreateImageDto, UpdateImageDto } from './image.dto';
import {
  RabbitMQService,
  RMQRequest
} from 'src/shared/rabbitmq/rabbitmq.service';
import { IFilter } from 'src/common/decorators/filter.decorator';
import { IMAGE_PATTERN } from './image.pattern';

@Injectable()
export class ImageService {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async create(createImageDto: CreateImageDto) {
    const request: RMQRequest = {
      pattern: IMAGE_PATTERN.CREATE,
      payload: createImageDto
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async findAll(filter?: IFilter) {
    const request: RMQRequest = {
      pattern: IMAGE_PATTERN.FIND_ALL,
      filter
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async findOne(id: number) {
    const request: RMQRequest = {
      pattern: IMAGE_PATTERN.FIND_ONE,
      id
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async update(id: number, updateImageDto: UpdateImageDto) {
    const request: RMQRequest = {
      pattern: IMAGE_PATTERN.UPDATE,
      id,
      payload: updateImageDto
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async remove(id: number) {
    const request: RMQRequest = {
      pattern: IMAGE_PATTERN.REMOVE,
      id
    };
    return await this.rabbitMQService.sendRequest(request);
  }
}
