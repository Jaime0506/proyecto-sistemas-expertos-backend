import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RuleFactService } from './rule-fact.service';
import { RuleFactController } from './rule-fact.controller';
import { RuleFact } from './entities/rule-fact.entity';

@Module({
	imports: [TypeOrmModule.forFeature([RuleFact])],
	controllers: [RuleFactController],
	providers: [RuleFactService],
})
export class RuleFactModule {}
