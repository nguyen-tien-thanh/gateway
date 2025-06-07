import { Injectable } from '@nestjs/common';
import { CreateAssetDto, UpdateAssetDto } from './asset.dto';
import {
  RabbitMQService,
  RMQRequest
} from 'src/shared/rabbitmq/rabbitmq.service';
import { IFilter } from 'src/common/decorators/filter.decorator';
import { ASSET_PATTERN } from './asset.pattern';

@Injectable()
export class AssetService {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async create(createAssetDto: CreateAssetDto) {
    const request: RMQRequest = {
      pattern: ASSET_PATTERN.CREATE,
      payload: createAssetDto
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async findAll(filter?: IFilter) {
    const request: RMQRequest = {
      pattern: ASSET_PATTERN.FIND_ALL,
      filter
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async findOne(id: number) {
    const request: RMQRequest = {
      pattern: ASSET_PATTERN.FIND_ONE,
      id
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async update(id: number, updateAssetDto: UpdateAssetDto) {
    const request: RMQRequest = {
      pattern: ASSET_PATTERN.UPDATE,
      id,
      payload: updateAssetDto
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async remove(id: number) {
    const request: RMQRequest = {
      pattern: ASSET_PATTERN.DELETE,
      id
    };
    return await this.rabbitMQService.sendRequest(request);
  }
}
