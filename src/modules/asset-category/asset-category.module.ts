import { Module } from '@nestjs/common';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';
import { AssetCategoryController } from './asset-category.controller';
import { AssetCategoryService } from './asset-category.service';

@Module({
  imports: [RabbitMQModule],
  controllers: [AssetCategoryController],
  providers: [AssetCategoryService]
})
export class AssetCategoryModule {}
