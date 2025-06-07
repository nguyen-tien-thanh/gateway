import { Injectable } from '@nestjs/common';
import { CreateQRCodeDto, UpdateQRCodeDto } from './qr-code.dto';
import {
  RabbitMQService,
  RMQRequest
} from 'src/shared/rabbitmq/rabbitmq.service';
import { IFilter } from 'src/common/decorators/filter.decorator';
import { QR_CODE_PATTERN } from './qr-code.pattern';

@Injectable()
export class QRCodeService {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async create(createQRCodeDto: CreateQRCodeDto) {
    const request: RMQRequest = {
      pattern: QR_CODE_PATTERN.CREATE,
      payload: createQRCodeDto
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async findAll(filter?: IFilter) {
    const request: RMQRequest = {
      pattern: QR_CODE_PATTERN.FIND_ALL,
      filter
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async findOne(id: number) {
    const request: RMQRequest = {
      pattern: QR_CODE_PATTERN.FIND_ONE,
      id
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async update(id: number, updateQRCodeDto: UpdateQRCodeDto) {
    const request: RMQRequest = {
      pattern: QR_CODE_PATTERN.UPDATE,
      id,
      payload: updateQRCodeDto
    };
    return await this.rabbitMQService.sendRequest(request);
  }

  async remove(id: number) {
    const request: RMQRequest = {
      pattern: QR_CODE_PATTERN.DELETE,
      id
    };
    return await this.rabbitMQService.sendRequest(request);
  }
}
