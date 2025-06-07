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
import { AssetCategoryService } from './asset-category.service';
import {
  CreateAssetCategoryDto,
  UpdateAssetCategoryDto
} from './asset-category.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtTwoFactorGuard } from 'src/common/guard/jwt-two-factor.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UserWithRole } from '../auth/models/user.model';
import { Filter } from 'src/common/decorators/filter.decorator';
import { IFilter } from 'src/common/decorators/filter.decorator';

@ApiTags('asset-category')
@Controller('asset-category')
export class AssetCategoryController {
  constructor(private readonly assetCategoryService: AssetCategoryService) {}

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Post()
  create(
    @Body() createAssetCategoryDto: CreateAssetCategoryDto,
    @GetUser() user: UserWithRole
  ) {
    return this.assetCategoryService.create({
      ...createAssetCategoryDto,
      createdBy: user.id
    });
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Get()
  findAll(@Filter() filter?: IFilter) {
    return this.assetCategoryService.findAll(filter);
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetCategoryService.findOne(+id);
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAssetCategoryDto: UpdateAssetCategoryDto,
    @GetUser() user: UserWithRole
  ) {
    return this.assetCategoryService.update(+id, {
      ...updateAssetCategoryDto,
      updatedBy: user.id
    });
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetCategoryService.remove(+id);
  }
}
