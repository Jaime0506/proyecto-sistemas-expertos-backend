import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OptionFactService } from './option-fact.service';
import { OptionFactController } from './option-fact.controller';
import { OptionFact } from './entities/option-fact.entity';

@Module({
	imports: [TypeOrmModule.forFeature([OptionFact])],
	controllers: [OptionFactController],
	providers: [OptionFactService],
})
export class OptionFactModule {}
