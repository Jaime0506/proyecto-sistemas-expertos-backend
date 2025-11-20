import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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
import { Rule } from '../rules/entities/rule.entity';
import { Fact } from '../facts/entities/fact.entity';
import { Failure } from '../failures/entities/failure.entity';
import { Cliente } from '../users/entities/cliente.entity';
import { ForwardChainingService } from './algorithms/forward-chaining.service';
import { StartEvaluationDto } from './dto/start-evaluation.dto';
import { EvaluationResultDto, ProductRecommendationDto, RuleExecutionDto } from './dto/evaluation-result.dto';

@Injectable()
export class InferenceEngineService {
  private readonly logger = new Logger(InferenceEngineService.name);

  constructor(
    @InjectRepository(EvaluationSession)
    private evaluationSessionRepository: Repository<EvaluationSession>,
    @InjectRepository(RuleExecution)
    private ruleExecutionRepository: Repository<RuleExecution>,
    @InjectRepository(EvaluationInputData)
    private evaluationInputDataRepository: Repository<EvaluationInputData>,
    @InjectRepository(EvaluationFactsDetected)
    private evaluationFactsDetectedRepository: Repository<EvaluationFactsDetected>,
    @InjectRepository(EvaluationResults)
    private evaluationResultsRepository: Repository<EvaluationResults>,
    @InjectRepository(EvaluationResultFailure)
    private evaluationResultFailureRepository: Repository<EvaluationResultFailure>,
    @InjectRepository(EvaluationResultSpecialCondition)
    private evaluationResultSpecialConditionRepository: Repository<EvaluationResultSpecialCondition>,
    @InjectRepository(RuleExecutionCondition)
    private ruleExecutionConditionRepository: Repository<RuleExecutionCondition>,
    @InjectRepository(RuleExecutionFactsUsed)
    private ruleExecutionFactsUsedRepository: Repository<RuleExecutionFactsUsed>,
    @InjectRepository(ProductRecommendation)
    private productRecommendationRepository: Repository<ProductRecommendation>,
    @InjectRepository(ProductRecommendationSpecialCondition)
    private productRecommendationSpecialConditionRepository: Repository<ProductRecommendationSpecialCondition>,
    @InjectRepository(ProductTemplate)
    private productTemplateRepository: Repository<ProductTemplate>,
    @InjectRepository(Rule)
    private ruleRepository: Repository<Rule>,
    @InjectRepository(Fact)
    private factRepository: Repository<Fact>,
    @InjectRepository(Failure)
    private failureRepository: Repository<Failure>,
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
    private forwardChainingService: ForwardChainingService,
  ) {}

  /**
   * Genera un ID único para la sesión de evaluación
   */
  private generateSessionId(): string {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '_').split('.')[0];
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `eval_${timestamp}_${random}`;
  }

  /**
   * Genera recomendaciones de productos basadas en el perfil de riesgo y facts
   * Lee las plantillas desde la base de datos
   */
  private async generateProductRecommendations(
    riskProfile: string,
    recommendedProducts: string[],
    inputData: any,
    evaluationSessionId: number
  ): Promise<ProductRecommendationDto[]> {
    const recommendations: ProductRecommendationDto[] = [];
    const smmlv = 1300000; // SMMLV 2024
    const monthlyIncome = inputData.monthly_income || 0;

    // Obtener todas las plantillas de productos activas con sus condiciones especiales
    const productTemplates = await this.productTemplateRepository.find({
      where: { is_active: true },
      relations: ['special_conditions'],
      order: { product_code: 'ASC' }
    });

    // Crear un mapa de plantillas por código
    const templateMap = new Map<string, ProductTemplate>();
    productTemplates.forEach(template => {
      templateMap.set(template.product_code, template);
    });

    // Arrays para guardar en batch
    const recommendationsToSave: any[] = [];
    const conditionsToSave: any[] = [];
    const templateConditionsMap = new Map<string, ProductTemplateSpecialCondition[]>();

    // Generar recomendaciones basadas en productos detectados
    for (const productCode of recommendedProducts) {
      const template = templateMap.get(productCode);
      if (template) {
        // Calcular monto máximo
        let maxAmount: number;
        if (template.base_max_amount_multiplier) {
          maxAmount = Math.min(monthlyIncome * Number(template.base_max_amount_multiplier), Number(template.base_max_amount_fixed || 999999999));
        } else {
          maxAmount = Number(template.base_max_amount_fixed || 0);
        }

        // Calcular tasa de interés según perfil de riesgo
        let interestRate: number;
        if (riskProfile === 'BAJO' && template.interest_rate_risk_low) {
          interestRate = Number(template.interest_rate_risk_low);
        } else if (riskProfile === 'MEDIO' && template.interest_rate_risk_medium) {
          interestRate = Number(template.interest_rate_risk_medium);
        } else if (riskProfile === 'ALTO' && template.interest_rate_risk_high) {
          interestRate = Number(template.interest_rate_risk_high);
        } else {
          interestRate = Number(template.base_interest_rate || 0);
        }

        // Obtener condiciones especiales
        const specialConditions = template.special_conditions?.map(sc => sc.condition_text) || [];

        const recommendation: ProductRecommendationDto = {
          name: template.product_name,
          description: template.description || '',
          max_amount: maxAmount,
          max_term_months: template.max_term_months || 0,
          interest_rate: interestRate,
          special_conditions: specialConditions,
          confidence: Number(template.base_confidence)
        };

        recommendations.push(recommendation);

        // Preparar recomendación para guardar en batch
        const productRecommendation = this.productRecommendationRepository.create({
          evaluation_session_id: evaluationSessionId,
          product_code: template.product_code,
          product_name: template.product_name,
          description: template.description,
          max_amount: maxAmount,
          max_term_months: template.max_term_months,
          interest_rate: interestRate,
          confidence: template.base_confidence
        });
        recommendationsToSave.push(productRecommendation);
        
        // Preparar condiciones especiales para guardar después
        if (template.special_conditions && template.special_conditions.length > 0) {
          templateConditionsMap.set(template.product_code, template.special_conditions);
        }
      }
    }

    // Si no hay productos específicos recomendados, sugerir según perfil de riesgo
    if (recommendations.length === 0) {
      const defaultProducts = riskProfile === 'BAJO' 
        ? ['CREDITO_LIBRE_INVERSION', 'TARJETA_CREDITO']
        : riskProfile === 'MEDIO'
        ? ['CREDITO_CON_CODEUDOR', 'MICROCREDITO']
        : [];

      for (const productCode of defaultProducts) {
        const template = templateMap.get(productCode);
        if (template) {
          let maxAmount: number;
          if (template.base_max_amount_multiplier) {
            maxAmount = Math.min(monthlyIncome * Number(template.base_max_amount_multiplier), Number(template.base_max_amount_fixed || 999999999));
          } else {
            maxAmount = Number(template.base_max_amount_fixed || 0);
          }

          let interestRate: number;
          if (riskProfile === 'BAJO' && template.interest_rate_risk_low) {
            interestRate = Number(template.interest_rate_risk_low);
          } else if (riskProfile === 'MEDIO' && template.interest_rate_risk_medium) {
            interestRate = Number(template.interest_rate_risk_medium);
          } else {
            interestRate = Number(template.base_interest_rate || 0);
          }

          const specialConditions = template.special_conditions?.map(sc => sc.condition_text) || [];

          recommendations.push({
            name: template.product_name,
            description: template.description || '',
            max_amount: maxAmount,
            max_term_months: template.max_term_months || 0,
            interest_rate: interestRate,
            special_conditions: specialConditions,
            confidence: Number(template.base_confidence)
          });

          // Preparar recomendación para guardar en batch
          const productRecommendation = this.productRecommendationRepository.create({
            evaluation_session_id: evaluationSessionId,
            product_code: template.product_code,
            product_name: template.product_name,
            description: template.description,
            max_amount: maxAmount,
            max_term_months: template.max_term_months,
            interest_rate: interestRate,
            confidence: template.base_confidence
          });
          recommendationsToSave.push(productRecommendation);
          
          // Preparar condiciones especiales para guardar después
          if (template.special_conditions && template.special_conditions.length > 0) {
            templateConditionsMap.set(template.product_code, template.special_conditions);
          }
        }
      }
    }

    // Guardar todas las recomendaciones en batch
    if (recommendationsToSave.length > 0) {
      const savedRecommendations = await this.productRecommendationRepository.save(recommendationsToSave);
      
      // Guardar condiciones especiales en batch
      for (let i = 0; i < savedRecommendations.length; i++) {
        const savedRecommendation = savedRecommendations[i];
        const conditions = templateConditionsMap.get(savedRecommendation.product_code);
        if (conditions && conditions.length > 0) {
          for (const condition of conditions) {
            conditionsToSave.push(
              this.productRecommendationSpecialConditionRepository.create({
                product_recommendation_id: savedRecommendation.id,
                condition_text: condition.condition_text
              })
            );
          }
        }
      }
      
      if (conditionsToSave.length > 0) {
        await this.productRecommendationSpecialConditionRepository.save(conditionsToSave);
      }
    }

    return recommendations;
  }

  /**
   * Genera explicación detallada de la decisión
   */
  private generateExplanation(
    finalDecision: string,
    riskProfile: string,
    failures: string[],
    recommendedProducts: string[],
    facts: string[]
  ): string {
    let explanation = '';

    if (finalDecision === 'RECHAZADO') {
      explanation = `Solicitud rechazada por los siguientes motivos:\n`;
      explanation += `• ${failures.join('\n• ')}\n\n`;
      explanation += `Para mejorar su perfil crediticio, considere:\n`;
      explanation += `• Reducir su nivel de endeudamiento\n`;
      explanation += `• Mejorar su historial de pagos\n`;
      explanation += `• Aumentar sus ingresos comprobables`;
    } else if (finalDecision === 'APROBADO') {
      explanation = `Solicitud aprobada con perfil de riesgo ${riskProfile}.\n\n`;
      explanation += `Factores positivos identificados:\n`;
      explanation += `• ${facts.slice(0, 5).join('\n• ')}\n\n`;
      
      if (recommendedProducts.length > 0) {
        explanation += `Productos recomendados:\n`;
        explanation += `• ${recommendedProducts.join('\n• ')}`;
      }
    } else if (finalDecision === 'CONDICIONADO') {
      explanation = `Solicitud aprobada con condiciones especiales.\n\n`;
      explanation += `Perfil de riesgo: ${riskProfile}\n`;
      explanation += `Se requieren garantías adicionales o condiciones específicas.`;
    } else {
      explanation = `Solicitud en revisión manual.\n\n`;
      explanation += `Su caso requiere evaluación adicional por parte de nuestro equipo especializado.`;
    }

    return explanation;
  }

  /**
   * Calcula el score de confianza basado en los resultados
   */
  private calculateConfidenceScore(
    facts: string[],
    failures: string[],
    ruleExecutions: any[]
  ): number {
    this.logger.debug(`Calculando score de confianza - Facts: ${facts.length}, Failures: ${failures.length}, Reglas: ${ruleExecutions.length}`);
    
    let confidence = 85; // Base de confianza más alta

    // Reducir confianza por failures (menos agresivo)
    confidence -= failures.length * 8;

    // Reducir confianza por reglas fallidas (menos agresivo)
    const failedRules = ruleExecutions.filter(r => r.result === 'FAIL').length;
    confidence -= failedRules * 2;

    // Aumentar confianza por facts positivos
    const positiveFacts = facts.filter(f => 
      f.includes('MIN_') || f.includes('MAX_') || f.includes('BAJO') || f.includes('EXCELENTE') || f.includes('FACT_')
    ).length;
    confidence += positiveFacts * 1.5;

    // Aumentar confianza por reglas exitosas
    const successfulRules = ruleExecutions.filter(r => r.result === 'PASS').length;
    confidence += successfulRules * 0.5;

    // Asegurar que la confianza esté en rango válido
    const finalConfidence = Math.max(10, Math.min(100, Math.round(confidence)));
    
    this.logger.debug(`Confianza calculada: ${finalConfidence}%`);
    
    return finalConfidence;
  }

  /**
   * Determina la decisión final basada en los resultados
   */
  private determineFinalDecision(
    failures: string[],
    riskProfile: string,
    recommendedProducts: string[]
  ): string {
    // Si hay failures críticos de admisibilidad, rechazar
    const criticalFailures = failures.filter(f => 
      f.includes('EDAD_FUERA_RANGO') ||
      f.includes('INGRESOS_INSUFICIENTES') ||
      f.includes('SCORE_INSUFICIENTE') ||
      f.includes('ENDEUDAMIENTO_EXCESIVO') ||
      f.includes('MORA_RECIENTE_SIGNIFICATIVA')
    );

    if (criticalFailures.length > 0) {
      return 'RECHAZADO';
    }

    // Si hay failures normativos, rechazar
    const normativeFailures = failures.filter(f => 
      f.includes('SARLAFT') ||
      f.includes('MULTIPLES_CONSULTAS')
    );

    if (normativeFailures.length > 0) {
      return 'RECHAZADO';
    }

    // Si hay failures de PEP, pendiente
    const pepFailures = failures.filter(f => f.includes('PEP'));
    if (pepFailures.length > 0) {
      return 'PENDIENTE';
    }

    // Si hay productos recomendados, aprobar
    if (recommendedProducts.length > 0) {
      return 'APROBADO';
    }

    // Si es riesgo alto sin productos, condicionado
    if (riskProfile === 'RIESGO_ALTO' || riskProfile === 'ALTO') {
      return 'CONDICIONADO';
    }

    // Si es riesgo medio sin productos, aprobar condicionado
    if (riskProfile === 'RIESGO_MEDIO' || riskProfile === 'MEDIO') {
      return 'APROBADO';
    }

    // Si es riesgo bajo sin productos, aprobar
    if (riskProfile === 'RIESGO_BAJO' || riskProfile === 'BAJO') {
      return 'APROBADO';
    }
    
    // Normalizar el formato del perfil de riesgo (puede venir como RIESGO_BAJO o BAJO)
    const normalizedRiskProfile = riskProfile.replace('RIESGO_', '');
    if (normalizedRiskProfile === 'ALTO') {
      return 'CONDICIONADO';
    }
    if (normalizedRiskProfile === 'MEDIO') {
      return 'APROBADO';
    }
    if (normalizedRiskProfile === 'BAJO') {
      return 'APROBADO';
    }

    // Caso por defecto: pendiente revisión manual
    return 'PENDIENTE';
  }

  /**
   * Ejecuta la evaluación completa del sistema experto
   */
  async evaluateUser(evaluationData: StartEvaluationDto): Promise<EvaluationResultDto> {
    const startTime = Date.now();
    const sessionId = evaluationData.session_id || this.generateSessionId();

    this.logger.log(`Iniciando evaluación del sistema experto - Sesión: ${sessionId} - Cliente: ${evaluationData.cliente_id}`);

    try {
      // 1. Validar que el cliente existe
      const cliente = await this.clienteRepository.findOne({
        where: { id: evaluationData.cliente_id }
      });

      if (!cliente) {
        throw new Error(`Cliente con ID ${evaluationData.cliente_id} no encontrado`);
      }

      // 2. Crear sesión de evaluación
      const evaluationSession = this.evaluationSessionRepository.create({
        session_id: sessionId,
        cliente_id: evaluationData.cliente_id,
        status: 'PENDING'
      });
      await this.evaluationSessionRepository.save(evaluationSession);

      // 3. Guardar input_data en tabla normalizada
      const inputDataEntity = this.evaluationInputDataRepository.create({
        evaluation_session_id: evaluationSession.id,
        age: evaluationData.input_data.age,
        monthly_income: evaluationData.input_data.monthly_income,
        credit_score: evaluationData.input_data.credit_score,
        employment_status: evaluationData.input_data.employment_status,
        credit_purpose: evaluationData.input_data.credit_purpose,
        requested_amount: evaluationData.input_data.requested_amount,
        debt_to_income_ratio: evaluationData.input_data.debt_to_income_ratio,
        max_days_delinquency: evaluationData.input_data.max_days_delinquency,
        employment_tenure_months: evaluationData.input_data.employment_tenure_months,
        payment_to_income_ratio: evaluationData.input_data.payment_to_income_ratio,
        down_payment_percentage: evaluationData.input_data.down_payment_percentage,
        has_co_borrower: evaluationData.input_data.has_co_borrower,
        co_borrower_income: evaluationData.input_data.co_borrower_income,
        is_microenterprise: evaluationData.input_data.is_microenterprise,
        economic_activity: evaluationData.input_data.economic_activity,
        is_pep: evaluationData.input_data.is_pep,
        pep_committee_approval: evaluationData.input_data.pep_committee_approval,
        recent_inquiries: evaluationData.input_data.recent_inquiries,
        customer_tenure_months: evaluationData.input_data.customer_tenure_months,
        historical_compliance: evaluationData.input_data.historical_compliance,
        is_convention_employee: evaluationData.input_data.is_convention_employee,
        payroll_discount_authorized: evaluationData.input_data.payroll_discount_authorized,
        employment_type: evaluationData.input_data.employment_type,
        pension_amount: evaluationData.input_data.pension_amount,
        is_legal_pension: evaluationData.input_data.is_legal_pension
      });
      await this.evaluationInputDataRepository.save(inputDataEntity);

      // 4. Ejecutar encadenamiento hacia adelante
      const forwardChainingResult = await this.forwardChainingService.executeForwardChaining(
        evaluationData.input_data
      );

      // 5. Guardar facts detectados (optimizado: carga batch)
      const uniqueFacts = [...new Set(forwardChainingResult.facts)];
      if (uniqueFacts.length > 0) {
        const facts = await this.factRepository.find({
          where: uniqueFacts.map(code => ({ code }))
        });
        const factMap = new Map(facts.map(f => [f.code, f]));
        
        const factsToSave = uniqueFacts
          .map(factCode => {
            const fact = factMap.get(factCode);
            if (fact) {
              return this.evaluationFactsDetectedRepository.create({
                evaluation_session_id: evaluationSession.id,
                fact_code: factCode,
                fact_id: fact.id
              });
            }
            return null;
          })
          .filter((item): item is NonNullable<typeof item> => item !== null);
        
        if (factsToSave.length > 0) {
          await this.evaluationFactsDetectedRepository.save(factsToSave);
        }
      }

      // 6. Determinar decisión final
      const finalDecision = this.determineFinalDecision(
        forwardChainingResult.failures,
        forwardChainingResult.riskProfile,
        forwardChainingResult.recommendedProducts
      );

      // 7. Generar recomendaciones de productos (guarda en DB automáticamente)
      const productRecommendations = await this.generateProductRecommendations(
        forwardChainingResult.riskProfile,
        forwardChainingResult.recommendedProducts,
        evaluationData.input_data,
        evaluationSession.id
      );

      // 8. Calcular score de confianza
      const confidenceScore = this.calculateConfidenceScore(
        forwardChainingResult.facts,
        forwardChainingResult.failures,
        forwardChainingResult.ruleExecutions
      );

      // 9. Generar explicación
      const explanation = this.generateExplanation(
        finalDecision,
        forwardChainingResult.riskProfile,
        forwardChainingResult.failures,
        forwardChainingResult.recommendedProducts,
        forwardChainingResult.facts
      );

      // 10. Guardar ejecuciones de reglas con condiciones y facts usados (optimizado)
      if (forwardChainingResult.ruleExecutions.length > 0) {
        // Cargar todas las reglas de una vez
        const ruleCodes = forwardChainingResult.ruleExecutions.map(re => re.rule_code);
        const rules = await this.ruleRepository.find({
          where: ruleCodes.map(code => ({ code }))
        });
        const ruleMap = new Map(rules.map(r => [r.code, r]));

        // Cargar todos los facts de una vez
        const allFactCodes = [...new Set(forwardChainingResult.facts)];
        const allFacts = await this.factRepository.find({
          where: allFactCodes.map(code => ({ code }))
        });
        const factMap = new Map(allFacts.map(f => [f.code, f]));

        // Preparar todas las ejecuciones de reglas
        const ruleExecutionsToSave: any[] = [];
        const ruleConditionsToSave: any[] = [];
        const ruleFactsUsedToSave: any[] = [];

        for (const ruleExecution of forwardChainingResult.ruleExecutions) {
          const rule = ruleMap.get(ruleExecution.rule_code);
          if (!rule) continue;

          const ruleExecutionEntity = this.ruleExecutionRepository.create({
            evaluation_session_id: evaluationSession.id,
            rule_id: rule.id,
            rule_applied: ruleExecution.result === 'PASS',
            result: ruleExecution.result,
            explanation: ruleExecution.explanation,
            execution_time_ms: ruleExecution.execution_time_ms
          });
          ruleExecutionsToSave.push(ruleExecutionEntity);
        }

        // Guardar todas las ejecuciones de reglas de una vez
        const savedExecutions = await this.ruleExecutionRepository.save(ruleExecutionsToSave);

        // Preparar condiciones y facts usados
        for (let i = 0; i < forwardChainingResult.ruleExecutions.length; i++) {
          const ruleExecution = forwardChainingResult.ruleExecutions[i];
          const savedExecution = savedExecutions[i];

          // Guardar condiciones de la regla
          if (ruleExecution.rule_conditions) {
            for (const [key, value] of Object.entries(ruleExecution.rule_conditions)) {
              ruleConditionsToSave.push(
                this.ruleExecutionConditionRepository.create({
                  rule_execution_id: savedExecution.id,
                  condition_key: key,
                  condition_value: String(value),
                  condition_type: typeof value === 'number' ? (Number.isInteger(value) ? 'integer' : 'decimal') : typeof value
                })
              );
            }
          }

          // Guardar facts usados en la ejecución (solo facts únicos)
          const uniqueFactsForRule = [...new Set(forwardChainingResult.facts)];
          for (const factCode of uniqueFactsForRule) {
            const fact = factMap.get(factCode);
            if (fact) {
              ruleFactsUsedToSave.push(
                this.ruleExecutionFactsUsedRepository.create({
                  rule_execution_id: savedExecution.id,
                  fact_code: factCode,
                  fact_id: fact.id
                })
              );
            }
          }
        }

        // Guardar condiciones y facts usados en batch
        if (ruleConditionsToSave.length > 0) {
          await this.ruleExecutionConditionRepository.save(ruleConditionsToSave);
        }
        if (ruleFactsUsedToSave.length > 0) {
          await this.ruleExecutionFactsUsedRepository.save(ruleFactsUsedToSave);
        }
      }

      // 11. Guardar evaluation_results
      const totalTime = Date.now() - startTime;
      const evaluationResult = this.evaluationResultsRepository.create({
        evaluation_session_id: evaluationSession.id,
        facts_count: forwardChainingResult.facts.length,
        rule_executions_count: forwardChainingResult.ruleExecutions.length,
        failures_count: forwardChainingResult.failures.length,
        recommended_products_count: productRecommendations.length,
        special_conditions_count: forwardChainingResult.specialConditions.length,
        risk_profile: forwardChainingResult.riskProfile,
        confidence_base: 85,
        confidence_failures_penalty: forwardChainingResult.failures.length * -8,
        confidence_failed_rules_penalty: forwardChainingResult.ruleExecutions.filter(re => re.result === 'FAIL').length * -1.8,
        confidence_positive_facts_bonus: forwardChainingResult.facts.length * 1.5,
        confidence_successful_rules_bonus: forwardChainingResult.ruleExecutions.filter(re => re.result === 'PASS').length * 0.5,
        execution_total_time_ms: totalTime
      });
      const savedEvaluationResult = await this.evaluationResultsRepository.save(evaluationResult);

      // Guardar failures relacionados (optimizado: carga batch)
      const uniqueFailures = [...new Set(forwardChainingResult.failures)];
      if (uniqueFailures.length > 0) {
        const failures = await this.failureRepository.find({
          where: uniqueFailures.map(name => ({ name }))
        });
        const failureMap = new Map(failures.map(f => [f.name, f]));

        // Verificar existentes en batch
        const existingFailures = await this.evaluationResultFailureRepository.find({
          where: {
            evaluation_result_id: savedEvaluationResult.id,
            failure_code: In(uniqueFailures)
          }
        });
        const existingFailureCodes = new Set(existingFailures.map(ef => ef.failure_code));

        const failuresToSave = uniqueFailures
          .filter(failureCode => !existingFailureCodes.has(failureCode))
          .map(failureCode => {
            const failure = failureMap.get(failureCode);
            if (failure) {
              return this.evaluationResultFailureRepository.create({
                evaluation_result_id: savedEvaluationResult.id,
                failure_code: failureCode,
                failure_id: failure.id
              });
            }
            return null;
          })
          .filter((item): item is NonNullable<typeof item> => item !== null);

        if (failuresToSave.length > 0) {
          await this.evaluationResultFailureRepository.save(failuresToSave);
        }
      }

      // Guardar condiciones especiales (optimizado: verificación batch)
      const uniqueSpecialConditions = [...new Set(forwardChainingResult.specialConditions)];
      if (uniqueSpecialConditions.length > 0) {
        // Verificar existentes en batch
        const existingConditions = await this.evaluationResultSpecialConditionRepository.find({
          where: {
            evaluation_result_id: savedEvaluationResult.id,
            condition_code: In(uniqueSpecialConditions)
          }
        });
        const existingConditionCodes = new Set(existingConditions.map(ec => ec.condition_code));

        const conditionsToSave = uniqueSpecialConditions
          .filter(conditionCode => !existingConditionCodes.has(conditionCode))
          .map(conditionCode =>
            this.evaluationResultSpecialConditionRepository.create({
              evaluation_result_id: savedEvaluationResult.id,
              condition_code: conditionCode,
              condition_description: conditionCode
            })
          );

        if (conditionsToSave.length > 0) {
          await this.evaluationResultSpecialConditionRepository.save(conditionsToSave);
        }
      }

      // 12. Actualizar sesión de evaluación
      evaluationSession.final_decision = finalDecision;
      evaluationSession.risk_profile = forwardChainingResult.riskProfile;
      evaluationSession.explanation = explanation;
      evaluationSession.confidence_score = confidenceScore;
      evaluationSession.status = 'COMPLETED';
      await this.evaluationSessionRepository.save(evaluationSession);

      // 13. Preparar respuesta
      const result: EvaluationResultDto = {
        session_id: sessionId,
        final_decision: finalDecision,
        risk_profile: forwardChainingResult.riskProfile,
        confidence_score: confidenceScore,
        explanation: explanation,
        facts_detected: forwardChainingResult.facts,
        failures_detected: forwardChainingResult.failures,
        recommended_products: productRecommendations,
        rule_executions: forwardChainingResult.ruleExecutions.map(re => ({
          rule_code: re.rule_code,
          rule_name: re.rule_name,
          category: re.category,
          result: re.result,
          explanation: re.explanation,
          execution_time_ms: re.execution_time_ms
        })),
        total_execution_time_ms: totalTime,
        evaluated_at: new Date().toISOString()
      };

      this.logger.log(`Evaluación completada exitosamente en ${totalTime}ms - Resultado: ${finalDecision} - Riesgo: ${forwardChainingResult.riskProfile} - Confianza: ${confidenceScore}%`);

      return result;

    } catch (error) {
      this.logger.error('Error en evaluación del sistema experto:', error);
      
      // Marcar sesión como fallida
      const evaluationSession = await this.evaluationSessionRepository.findOne({
        where: { session_id: sessionId }
      });
      
      if (evaluationSession) {
        evaluationSession.status = 'FAILED';
        await this.evaluationSessionRepository.save(evaluationSession);
      }

      throw error;
    }
  }

  /**
   * Obtiene el historial de evaluaciones de un cliente
   */
  async getEvaluationHistory(clienteId: number): Promise<EvaluationSession[]> {
    return await this.evaluationSessionRepository.find({
      where: { cliente_id: clienteId },
      relations: [
        'cliente',
        'input_data',
        'facts_detected',
        'facts_detected.fact',
        'evaluation_result',
        'evaluation_result.failures',
        'evaluation_result.special_conditions',
        'recommended_products',
        'recommended_products.special_conditions'
      ],
      order: { created_at: 'DESC' },
      take: 10
    });
  }

  /**
   * Obtiene todas las evaluaciones (para panel administrativo)
   */
  async getAllEvaluations(limit: number = 50, offset: number = 0): Promise<{ evaluations: EvaluationSession[], total: number }> {
    const [evaluations, total] = await this.evaluationSessionRepository.findAndCount({
      relations: [
        'cliente',
        'input_data',
        'facts_detected',
        'evaluation_result',
        'recommended_products'
      ],
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset
    });

    return { evaluations, total };
  }

  /**
   * Obtiene una sesión de evaluación por session_id
   */
  async getEvaluationSessionBySessionId(sessionId: string): Promise<EvaluationSession | null> {
    return await this.evaluationSessionRepository.findOne({
      where: { session_id: sessionId },
      relations: [
        'cliente',
        'input_data',
        'facts_detected',
        'facts_detected.fact',
        'evaluation_result',
        'evaluation_result.failures',
        'evaluation_result.failures.failure',
        'evaluation_result.special_conditions',
        'recommended_products',
        'recommended_products.special_conditions'
      ]
    });
  }

  /**
   * Obtiene estadísticas del motor de inferencia
   */
  async getEngineStats(): Promise<any> {
    const totalEvaluations = await this.evaluationSessionRepository.count();
    const completedEvaluations = await this.evaluationSessionRepository.count({
      where: { status: 'COMPLETED' }
    });
    const failedEvaluations = await this.evaluationSessionRepository.count({
      where: { status: 'FAILED' }
    });

    const avgConfidence = await this.evaluationSessionRepository
      .createQueryBuilder('session')
      .select('AVG(session.confidence_score)', 'avgConfidence')
      .where('session.status = :status', { status: 'COMPLETED' })
      .getRawOne();

    return {
      total_evaluations: totalEvaluations,
      completed_evaluations: completedEvaluations,
      failed_evaluations: failedEvaluations,
      success_rate: totalEvaluations > 0 ? (completedEvaluations / totalEvaluations) * 100 : 0,
      average_confidence: avgConfidence?.avgConfidence || 0
    };
  }
}

