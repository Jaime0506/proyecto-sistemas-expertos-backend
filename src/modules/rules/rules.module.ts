import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RulesService } from './rules.service';
import { RulesController } from './rules.controller';
import { Rule } from './entities/rule.entity';
import { Failure } from '../failures/entities/failure.entity';
import { Experto } from '../users/entities/experto.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Rule, Failure, Experto])],
	controllers: [RulesController],
	providers: [RulesService],
	exports: [RulesService],
})
export class RulesModule {}
