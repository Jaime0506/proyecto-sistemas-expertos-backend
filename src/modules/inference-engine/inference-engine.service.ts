import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluationSession } from './entities/evaluation-session.entity';
import { RuleExecution } from './entities/rule-execution.entity';
import { ForwardChainingService } from './algorithms/forward-chaining.service';
import { StartEvaluationDto } from './dto/start-evaluation.dto';
import { EvaluationResultDto, ProductRecommendationDto, RuleExecutionDto } from './dto/evaluation-result.dto';

@Injectable()
export class InferenceEngineService {
  constructor(
    @InjectRepository(EvaluationSession)
    private evaluationSessionRepository: Repository<EvaluationSession>,
    @InjectRepository(RuleExecution)
    private ruleExecutionRepository: Repository<RuleExecution>,
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
   */
  private generateProductRecommendations(
    riskProfile: string,
    recommendedProducts: string[],
    inputData: any
  ): ProductRecommendationDto[] {
    const recommendations: ProductRecommendationDto[] = [];
    const smmlv = 1300000; // SMMLV 2024
    const monthlyIncome = inputData.monthly_income || 0;

    // Mapeo de productos a recomendaciones detalladas
    const productMappings = {
      'CREDITO_HIPOTECARIO': {
        name: 'Crédito Hipotecario',
        description: 'Crédito para adquisición de vivienda',
        max_amount: Math.min(monthlyIncome * 15, 200000000),
        max_term_months: 240,
        interest_rate: riskProfile === 'BAJO' ? 1.2 : riskProfile === 'MEDIO' ? 1.5 : 2.0,
        special_conditions: ['Requiere enganche mínimo del 20%', 'Seguro de vida obligatorio'],
        confidence: 95
      },
      'CREDITO_VEHICULO': {
        name: 'Crédito Vehículo',
        description: 'Crédito para adquisición de vehículo',
        max_amount: Math.min(monthlyIncome * 10, 80000000),
        max_term_months: 60,
        interest_rate: riskProfile === 'BAJO' ? 1.0 : riskProfile === 'MEDIO' ? 1.2 : 1.8,
        special_conditions: ['Seguro vehicular obligatorio', 'Hipoteca sobre el vehículo'],
        confidence: 90
      },
      'CREDITO_VEHICULO_CONDICIONADO': {
        name: 'Crédito Vehículo Condicionado',
        description: 'Crédito vehicular con condiciones especiales',
        max_amount: Math.min(monthlyIncome * 8, 60000000),
        max_term_months: 48,
        interest_rate: 1.5,
        special_conditions: ['Requiere enganche del 30%', 'Seguro de desempleo obligatorio'],
        confidence: 85
      },
      'CREDITO_LIBRE_INVERSION': {
        name: 'Crédito Libre Inversión',
        description: 'Crédito de libre inversión para gastos personales',
        max_amount: Math.min(monthlyIncome * 15, 50000000),
        max_term_months: 60,
        interest_rate: riskProfile === 'BAJO' ? 1.8 : riskProfile === 'MEDIO' ? 2.2 : 2.8,
        special_conditions: ['Antigüedad laboral mínima 12 meses'],
        confidence: 88
      },
      'CREDITO_CON_CODEUDOR': {
        name: 'Crédito con Codeudor',
        description: 'Crédito con codeudor solidario',
        max_amount: Math.min(monthlyIncome * 12, 30000000),
        max_term_months: 48,
        interest_rate: 2.0,
        special_conditions: ['Codeudor con ingresos mínimos 2 SMMLV', 'Evaluación conjunta obligatoria'],
        confidence: 80
      },
      'MICROCREDITO': {
        name: 'Microcrédito',
        description: 'Crédito para microempresarios',
        max_amount: 25000000,
        max_term_months: 36,
        interest_rate: 2.5,
        special_conditions: ['Actividad microempresarial comprobada', 'Capacitación financiera obligatoria'],
        confidence: 75
      },
      'TARJETA_CREDITO': {
        name: 'Tarjeta de Crédito',
        description: 'Tarjeta de crédito con cupo aprobado',
        max_amount: Math.min(monthlyIncome * 3, 15000000),
        max_term_months: 0, // Revolving
        interest_rate: 2.8,
        special_conditions: ['Cupo inicial según perfil', 'Seguro de protección de compras'],
        confidence: 92
      },
      'CREDITO_NOMINA': {
        name: 'Crédito de Nómina',
        description: 'Crédito con descuento por nómina',
        max_amount: Math.min(monthlyIncome * 8, 40000000),
        max_term_months: 36,
        interest_rate: 1.5,
        special_conditions: ['Descuento automático por nómina', 'Tasa preferencial'],
        confidence: 95
      },
      'CREDITO_PENSIONADOS': {
        name: 'Crédito para Pensionados',
        description: 'Crédito especial para pensionados',
        max_amount: Math.min(monthlyIncome * 6, 20000000),
        max_term_months: 72,
        interest_rate: 1.8,
        special_conditions: ['Descuento máximo 30% de mesada', 'Pensión legal comprobada'],
        confidence: 90
      }
    };

    // Generar recomendaciones basadas en productos detectados
    for (const product of recommendedProducts) {
      if (productMappings[product]) {
        recommendations.push(productMappings[product]);
      }
    }

    // Si no hay productos específicos recomendados, sugerir según perfil de riesgo
    if (recommendations.length === 0) {
      if (riskProfile === 'BAJO') {
        recommendations.push(productMappings['CREDITO_LIBRE_INVERSION']);
        recommendations.push(productMappings['TARJETA_CREDITO']);
      } else if (riskProfile === 'MEDIO') {
        recommendations.push(productMappings['CREDITO_CON_CODEUDOR']);
        recommendations.push(productMappings['MICROCREDITO']);
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
    console.log('🧮 Calculando score de confianza...', { facts: facts.length, failures: failures.length, rules: ruleExecutions.length });
    
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
    
    console.log(`📊 Confianza calculada: ${finalConfidence}% (base: 85, failures: -${failures.length * 8}, failedRules: -${failedRules * 2}, positiveFacts: +${positiveFacts * 1.5}, successfulRules: +${successfulRules * 0.5})`);
    
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

    // Caso por defecto: pendiente revisión manual
    return 'PENDIENTE';
  }

  /**
   * Ejecuta la evaluación completa del sistema experto
   */
  async evaluateUser(evaluationData: StartEvaluationDto): Promise<EvaluationResultDto> {
    const startTime = Date.now();
    const sessionId = evaluationData.session_id || this.generateSessionId();

    console.log(`🚀 Iniciando evaluación del sistema experto - Sesión: ${sessionId}`);

    try {
      // 1. Crear sesión de evaluación
      const evaluationSession = this.evaluationSessionRepository.create({
        session_id: sessionId,
        user_id: evaluationData.user_id,
        input_data: evaluationData.input_data,
        status: 'PENDING'
      });
      await this.evaluationSessionRepository.save(evaluationSession);

      // 2. Ejecutar encadenamiento hacia adelante
      const forwardChainingResult = await this.forwardChainingService.executeForwardChaining(
        evaluationData.input_data
      );

      // 3. Determinar decisión final
      const finalDecision = this.determineFinalDecision(
        forwardChainingResult.failures,
        forwardChainingResult.riskProfile,
        forwardChainingResult.recommendedProducts
      );

      // 4. Generar recomendaciones de productos
      const productRecommendations = this.generateProductRecommendations(
        forwardChainingResult.riskProfile,
        forwardChainingResult.recommendedProducts,
        evaluationData.input_data
      );

      // 5. Calcular score de confianza
      const confidenceScore = this.calculateConfidenceScore(
        forwardChainingResult.facts,
        forwardChainingResult.failures,
        forwardChainingResult.ruleExecutions
      );

      // 6. Generar explicación
      const explanation = this.generateExplanation(
        finalDecision,
        forwardChainingResult.riskProfile,
        forwardChainingResult.failures,
        forwardChainingResult.recommendedProducts,
        forwardChainingResult.facts
      );

      // 7. Guardar ejecuciones de reglas
      for (const ruleExecution of forwardChainingResult.ruleExecutions) {
        const ruleExecutionEntity = this.ruleExecutionRepository.create({
          evaluation_session_id: evaluationSession.id,
          rule_code: ruleExecution.rule_code,
          rule_name: ruleExecution.rule_name,
          rule_category: ruleExecution.category,
          rule_conditions: {},
          rule_facts_used: forwardChainingResult.facts,
          rule_applied: ruleExecution.result === 'PASS',
          result: ruleExecution.result,
          explanation: ruleExecution.explanation,
          execution_time_ms: ruleExecution.execution_time_ms,
          priority: ruleExecution.priority
        });
        await this.ruleExecutionRepository.save(ruleExecutionEntity);
      }

      // 8. Actualizar sesión de evaluación
      evaluationSession.facts_detected = forwardChainingResult.facts;
      evaluationSession.evaluation_result = {
        failures: forwardChainingResult.failures,
        riskProfile: forwardChainingResult.riskProfile,
        recommendedProducts: forwardChainingResult.recommendedProducts
      };
      evaluationSession.final_decision = finalDecision;
      evaluationSession.risk_profile = forwardChainingResult.riskProfile;
      evaluationSession.recommended_products = productRecommendations;
      evaluationSession.explanation = explanation;
      evaluationSession.confidence_score = confidenceScore;
      evaluationSession.status = 'COMPLETED';
      await this.evaluationSessionRepository.save(evaluationSession);

      const totalTime = Date.now() - startTime;

      // 9. Preparar respuesta
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

      console.log(`✅ Evaluación completada exitosamente en ${totalTime}ms`);
      console.log(`📊 Resultado: ${finalDecision} - Riesgo: ${forwardChainingResult.riskProfile} - Confianza: ${confidenceScore}%`);

      return result;

    } catch (error) {
      console.error('❌ Error en evaluación del sistema experto:', error);
      
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
   * Obtiene el historial de evaluaciones de un usuario
   */
  async getEvaluationHistory(userId: number): Promise<EvaluationSession[]> {
    return await this.evaluationSessionRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: 10
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
