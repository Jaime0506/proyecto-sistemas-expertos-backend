import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InferenceEngineService } from './inference-engine.service';
import { InferenceEngineController } from './inference-engine.controller';
import { ForwardChainingService } from './algorithms/forward-chaining.service';
import { EvaluationSession } from './entities/evaluation-session.entity';
import { RuleExecution } from './entities/rule-execution.entity';
import { Fact } from '../facts/entities/fact.entity';
import { Failure } from '../failures/entities/failure.entity';
import { FactsFailure } from '../facts-failure/entities/facts-failure.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EvaluationSession,
      RuleExecution,
      Fact,
      Failure,
      FactsFailure,
      User
    ])
  ],
  controllers: [InferenceEngineController],
  providers: [
    InferenceEngineService,
    ForwardChainingService
  ],
  exports: [
    InferenceEngineService,
    ForwardChainingService
  ],
})
export class InferenceEngineModule {}
