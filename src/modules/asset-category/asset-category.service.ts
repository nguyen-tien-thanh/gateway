import { Injectable } from '@nestjs/common';
import {
  CreateAssetCategoryDto,
  UpdateAssetCategoryDto
} from './asset-category.dto';
import {
  RabbitMQService,
  RMQRequest
} from 'src/shared/rabbitmq/rabbitmq.service';
import { IFilter } from 'src/common/decorators/filter.decorator';
import { ASSET_CATEGORY_PATTERN } from './asset-category.pattern';

@Injectable()
export class AssetCategoryService {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async create(createAssetCategoryDto: CreateAssetCategoryDto) {
    const request: RMQRequest = {
      pattern: ASSET_CATEGORY_PATTERN.CREATE,
      payload: createAssetCategoryDto
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async findAll(filter?: IFilter) {
    const request: RMQRequest = {
      pattern: ASSET_CATEGORY_PATTERN.FIND_ALL,
      filter
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async findOne(id: number) {
    const request: RMQRequest = {
      pattern: ASSET_CATEGORY_PATTERN.FIND_ONE,
      id
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async update(id: number, updateAssetCategoryDto: UpdateAssetCategoryDto) {
    const request: RMQRequest = {
      pattern: ASSET_CATEGORY_PATTERN.UPDATE,
      id,
      payload: updateAssetCategoryDto
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async remove(id: number) {
    const request: RMQRequest = {
      pattern: ASSET_CATEGORY_PATTERN.REMOVE,
      id
    };
    return await this.rabbitMQService.sendRequest(request);
  }
}
