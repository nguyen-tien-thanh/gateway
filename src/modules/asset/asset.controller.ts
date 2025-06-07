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
import { AssetService } from './asset.service';
import { CreateAssetDto, UpdateAssetDto } from './asset.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtTwoFactorGuard } from 'src/common/guard/jwt-two-factor.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UserWithRole } from '../auth/models/user.model';
import { Filter } from 'src/common/decorators/filter.decorator';
import { IFilter } from 'src/common/decorators/filter.decorator';

@ApiTags('asset')
@Controller('asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post()
  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  create(
    @Body() createAssetDto: CreateAssetDto,
    @GetUser() user: UserWithRole
  ) {
    return this.assetService.create({
      ...createAssetDto,
      createdBy: user.id
    });
  }

  @Get()
  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  findAll(@Filter() filter?: IFilter) {
    return this.assetService.findAll(filter);
  }

  @Get(':id')
  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  findOne(@Param('id') id: string) {
    return this.assetService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  update(
    @Param('id') id: string,
    @Body() updateAssetDto: UpdateAssetDto,
    @GetUser() user: UserWithRole
  ) {
    return this.assetService.update(+id, {
      ...updateAssetDto,
      updatedBy: user.id
    });
  }

  @Delete(':id')
  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  remove(@Param('id') id: string) {
    return this.assetService.remove(+id);
  }
}
