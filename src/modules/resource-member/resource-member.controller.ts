import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards
} from '@nestjs/common';
import { ResourceMemberService } from './resource-member.service';
import {
  CreateResourceMemberDto,
  UpdateResourceMemberDto
} from './resource-member.dto';
import { IFilter } from 'src/common/decorators/filter.decorator';
import { ApiTags } from '@nestjs/swagger';
import { JwtTwoFactorGuard } from 'src/common/guard/jwt-two-factor.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UserWithRole } from '../auth/models/user.model';

@ApiTags('resource-member')
@Controller('resource-member')
export class ResourceMemberController {
  constructor(private readonly resourceMemberService: ResourceMemberService) {}

  @Post()
  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  create(
    @Body() createResourceMemberDto: CreateResourceMemberDto,
    @GetUser() user: UserWithRole
  ) {
    return this.resourceMemberService.create({
      ...createResourceMemberDto,
      createdBy: user.id
    });
  }

  @Get()
  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  findAll(@Query() filter?: IFilter) {
    return this.resourceMemberService.findAll(filter);
  }

  @Get(':id')
  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  findOne(@Param('id') id: string) {
    return this.resourceMemberService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  update(
    @Param('id') id: string,
    @Body() updateResourceMemberDto: UpdateResourceMemberDto,
    @GetUser() user: UserWithRole
  ) {
    return this.resourceMemberService.update(+id, {
      ...updateResourceMemberDto,
      updatedBy: user.id
    });
  }

  @Delete(':id')
  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  remove(@Param('id') id: string) {
    return this.resourceMemberService.remove(+id);
  }
}
