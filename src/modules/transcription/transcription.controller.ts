import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards
} from '@nestjs/common';
import { TranscriptionService } from './transcription.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IFilter, Filter } from 'src/common/decorators/filter.decorator';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { JwtTwoFactorGuard } from 'src/common/guard/jwt-two-factor.guard';
import {
  CreateTranscriptionDto,
  UpdateTranscriptionDto
} from './transcription.dto';

@ApiTags('transcriptions')
@Controller('transcriptions')
@ApiBearerAuth()
@UseGuards(JwtTwoFactorGuard, PermissionGuard)
export class TranscriptionController {
  constructor(private readonly transcriptionService: TranscriptionService) {}

  @Get('count')
  count(@Filter() filter: IFilter) {
    return this.transcriptionService.count(filter);
  }

  @Post()
  create(@Body() createTranscriptionDto: CreateTranscriptionDto) {
    return this.transcriptionService.create(createTranscriptionDto);
  }

  @Get()
  findAll(@Filter() filter: IFilter) {
    return this.transcriptionService.findAll(filter);
  }

  @Get('call/:callId')
  findByCallId(@Param('callId') callId: string) {
    return this.transcriptionService.findByCallId(+callId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transcriptionService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTranscriptionDto: UpdateTranscriptionDto
  ) {
    return this.transcriptionService.update(+id, updateTranscriptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transcriptionService.remove(+id);
  }
}
