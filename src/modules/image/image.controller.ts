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
import { ImageService } from './image.service';
import { CreateImageDto, UpdateImageDto } from './image.dto';
import { JwtTwoFactorGuard } from 'src/common/guard/jwt-two-factor.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UserWithRole } from '../auth/models/user.model';
import { ApiTags } from '@nestjs/swagger';
import { Filter } from 'src/common/decorators/filter.decorator';
import { IFilter } from 'src/common/decorators/filter.decorator';

@ApiTags('image')
@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post()
  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  create(
    @Body() createImageDto: CreateImageDto,
    @GetUser() user: UserWithRole
  ) {
    return this.imageService.create({
      ...createImageDto,
      createdBy: user.id
    });
  }

  @Get()
  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  findAll(@Filter() filter?: IFilter) {
    return this.imageService.findAll(filter);
  }

  @Get(':id')
  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  findOne(@Param('id') id: string) {
    return this.imageService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  update(
    @Param('id') id: string,
    @Body() updateImageDto: UpdateImageDto,
    @GetUser() user: UserWithRole
  ) {
    return this.imageService.update(+id, {
      ...updateImageDto,
      updatedBy: user.id
    });
  }

  @Delete(':id')
  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  remove(@Param('id') id: string) {
    return this.imageService.remove(+id);
  }
}
