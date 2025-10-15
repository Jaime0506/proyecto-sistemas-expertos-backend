import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FactsService } from './facts.service';
import { FactsController } from './facts.controller';
import { Fact } from './entities/fact.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Fact])],
	controllers: [FactsController],
	providers: [FactsService],
})
export class FactsModule {}
