import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RulesService } from './rules.service';
import { RulesController } from './rules.controller';
import { Rule } from './entities/rule.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Rule])],
	controllers: [RulesController],
	providers: [RulesService],
})
export class RulesModule {}
