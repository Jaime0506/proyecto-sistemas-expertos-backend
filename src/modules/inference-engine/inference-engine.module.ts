import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InferenceEngineService } from './inference-engine.service';
import { InferenceEngineController } from './inference-engine.controller';
import { ForwardChainingService } from './algorithms/forward-chaining.service';
import { EvaluationSession } from './entities/evaluation-session.entity';
import { RuleExecution } from './entities/rule-execution.entity';
import { EvaluationInputData } from './entities/evaluation-input-data.entity';
import { EvaluationFactsDetected } from './entities/evaluation-facts-detected.entity';
import { EvaluationResults } from './entities/evaluation-results.entity';
import { EvaluationResultFailure } from './entities/evaluation-result-failure.entity';
import { EvaluationResultSpecialCondition } from './entities/evaluation-result-special-condition.entity';
import { RuleExecutionCondition } from './entities/rule-execution-condition.entity';
import { RuleExecutionFactsUsed } from './entities/rule-execution-facts-used.entity';
import { ProductRecommendation } from './entities/product-recommendation.entity';
import { ProductRecommendationSpecialCondition } from './entities/product-recommendation-special-condition.entity';
import { ProductTemplate } from './entities/product-template.entity';
import { ProductTemplateSpecialCondition } from './entities/product-template-special-condition.entity';
import { Fact } from '../facts/entities/fact.entity';
import { Failure } from '../failures/entities/failure.entity';
import { FactsFailure } from '../facts-failure/entities/facts-failure.entity';
import { Cliente } from '../users/entities/cliente.entity';
import { Rule } from '../rules/entities/rule.entity';
import { RuleFact } from '../rule-fact/entities/rule-fact.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EvaluationSession,
      RuleExecution,
      EvaluationInputData,
      EvaluationFactsDetected,
      EvaluationResults,
      EvaluationResultFailure,
      EvaluationResultSpecialCondition,
      RuleExecutionCondition,
      RuleExecutionFactsUsed,
      ProductRecommendation,
      ProductRecommendationSpecialCondition,
      ProductTemplate,
      ProductTemplateSpecialCondition,
      Fact,
      Failure,
      FactsFailure,
      Cliente,
      Rule,
      RuleFact
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
