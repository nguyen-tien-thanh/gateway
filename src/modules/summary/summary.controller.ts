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
import { SummaryService } from './summary.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IFilter, Filter } from 'src/common/decorators/filter.decorator';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { JwtTwoFactorGuard } from 'src/common/guard/jwt-two-factor.guard';
import { CreateSummaryDto, UpdateSummaryDto } from './summary.dto';

@ApiTags('summaries')
@Controller('summaries')
@ApiBearerAuth()
@UseGuards(JwtTwoFactorGuard, PermissionGuard)
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Get('count')
  count(@Filter() filter: IFilter) {
    return this.summaryService.count(filter);
  }

  @Post()
  create(@Body() createSummaryDto: CreateSummaryDto) {
    return this.summaryService.create(createSummaryDto);
  }

  @Get()
  findAll(@Filter() filter: IFilter) {
    return this.summaryService.findAll(filter);
  }

  @Get('call/:callId')
  findByCallId(@Param('callId') callId: string) {
    return this.summaryService.findByCallId(+callId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.summaryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSummaryDto: UpdateSummaryDto) {
    return this.summaryService.update(+id, updateSummaryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.summaryService.remove(+id);
  }
}
