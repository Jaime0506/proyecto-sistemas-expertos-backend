import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fact } from '../../facts/entities/fact.entity';
import { Failure } from '../../failures/entities/failure.entity';
import { FactsFailure } from '../../facts-failure/entities/facts-failure.entity';
import { Rule } from '../../rules/entities/rule.entity';
import { RuleFact } from '../../rule-fact/entities/rule-fact.entity';

export interface RuleCondition {
  fact_code: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal' | 'contains' | 'not_equals';
  value: any;
  required: boolean;
}

export interface RuleDefinition {
  code: string;
  name: string;
  category: string;
  priority: number;
  conditions: RuleCondition[];
  failure_detected?: string;
  success_action?: string;
  description: string;
  invert_logic?: boolean; // Si es true, la regla falla cuando los facts están presentes
  use_or_logic?: boolean; // Si es true, la regla pasa si AL MENOS UNA condición se cumple (OR), en lugar de todas (AND)
}

@Injectable()
export class ForwardChainingService {
  private readonly logger = new Logger(ForwardChainingService.name);

  constructor(
    @InjectRepository(Fact)
    private factRepository: Repository<Fact>,
    @InjectRepository(Failure)
    private failureRepository: Repository<Failure>,
    @InjectRepository(FactsFailure)
    private factsFailureRepository: Repository<FactsFailure>,
    @InjectRepository(Rule)
    private ruleRepository: Repository<Rule>,
    @InjectRepository(RuleFact)
    private ruleFactRepository: Repository<RuleFact>,
  ) {}

  /**
   * Obtiene las reglas del sistema desde la base de datos
   */
  private async getSystemRulesFromDB(): Promise<RuleDefinition[]> {
    const rules = await this.ruleRepository.find({
      relations: ['rule_facts', 'rule_facts.fact', 'failure'],
      order: { priority: 'ASC' }
    });

    const ruleDefinitions: RuleDefinition[] = [];

    for (const rule of rules) {
      // Usar los rule_facts ya cargados en la relación, ordenados por posición
      const ruleFacts = (rule.rule_facts || [])
        .filter(rf => rf.fact) // Asegurar que el fact esté cargado
        .sort((a, b) => a.position - b.position);

      const conditions: RuleCondition[] = ruleFacts.map(rf => ({
        fact_code: rf.fact.code,
        operator: 'equals' as const,
        value: true,
        required: true
      }));

      ruleDefinitions.push({
        code: rule.code,
        name: rule.name || '',
        category: rule.category || '',
        priority: rule.priority || 0,
        conditions,
        failure_detected: rule.failure?.name,
        success_action: rule.success_action || undefined,
        description: rule.description || '',
        use_or_logic: rule.logic_type === 'OR',
        invert_logic: rule.category === 'NORMATIVA' ? true : false
      });
    }

    return ruleDefinitions;
  }


  /**
   * Convierte los datos de entrada del usuario en facts del sistema
   */
  async convertInputToFacts(inputData: any): Promise<string[]> {
    const facts: string[] = [];
    const startTime = Date.now();

    this.logger.debug('Convirtiendo datos de entrada a facts...');

    // Mapeo de datos de entrada a facts
    const factMappings = {
      // Edad
      age: (age: number) => {
        if (age >= 18 && age <= 75) {
          facts.push('FACT_EDAD_18_75');
        } else if (age < 18) {
          facts.push('FACT_EDAD_MENOR_18');
        } else if (age > 75) {
          facts.push('FACT_EDAD_MAYOR_75');
        }
      },

      // Ingresos mensuales
      monthly_income: (income: number) => {
        const smmlv = 1300000; // SMMLV 2024
        if (income >= smmlv) {
          facts.push('FACT_INGRESOS_MIN_1_SMMLV');
        } else {
          facts.push('FACT_INGRESOS_INSUFICIENTES');
        }
        
        if (income >= 4 * smmlv) {
          facts.push('FACT_INGRESOS_MIN_4_SMMLV');
        }
        if (income >= 3 * smmlv) {
          facts.push('FACT_INGRESOS_MIN_3_SMMLV');
        }
        if (income >= 2 * smmlv) {
          facts.push('FACT_INGRESOS_MIN_2_SMMLV');
        }
      },

      // Score crediticio
      credit_score: (score: number) => {
        if (score >= 300) {
          facts.push('FACT_SCORE_MIN_300');
        } else {
          facts.push('FACT_SCORE_INSUFICIENTE');
        }
        
        if (score >= 700) {
          facts.push('FACT_SCORE_700_PLUS');
        } else if (score >= 500 && score < 700) {
          facts.push('FACT_SCORE_500_699');
        } else if (score >= 300 && score < 500) {
          facts.push('FACT_SCORE_300_499');
        }
      },

      // Endeudamiento (acepta porcentajes 0-100 o decimales 0-1)
      debt_to_income_ratio: (ratio: number) => {
        const normalizedRatio = ratio > 1 ? ratio / 100 : ratio;
        
        if (normalizedRatio <= 0.50) {
          facts.push('FACT_ENDEUDAMIENTO_MAX_50');
        } else {
          facts.push('FACT_ENDEUDAMIENTO_EXCESIVO');
        }
      },

      // Mora
      max_days_delinquency: (days: number) => {
        if (days <= 30) {
          facts.push('FACT_MORA_MAX_30_DIAS');
          facts.push('FACT_MORA_MAX_60_DIAS');  // Inclusivo: ≤30 también cumple ≤60
          facts.push('FACT_MORA_MAX_90_DIAS');  // Inclusivo: ≤30 también cumple ≤90
        } else if (days <= 60) {
          facts.push('FACT_MORA_MAX_60_DIAS');
          facts.push('FACT_MORA_MAX_90_DIAS');  // Inclusivo: ≤60 también cumple ≤90
        } else if (days <= 90) {
          facts.push('FACT_MORA_MAX_90_DIAS');
          facts.push('FACT_MORA_31_90_DIAS');
        } else {
          facts.push('FACT_MORA_RECIENTE_SIGNIFICATIVA');
        }
      },

      // Finalidad del crédito
      credit_purpose: (purpose: string) => {
        if (purpose === 'vivienda' || purpose === 'VIVIENDA') {
          facts.push('FACT_FINALIDAD_VIVIENDA');
        } else if (purpose === 'vehiculo' || purpose === 'VEHICULO') {
          facts.push('FACT_FINALIDAD_VEHICULO');
        }
      },


      // Antigüedad laboral
      employment_tenure_months: (months: number) => {
        if (months >= 12) {
          facts.push('FACT_ANTIGUEDAD_LABORAL_12_MESES');
        }
        if (months >= 24) {
          facts.push('FACT_ANTIGUEDAD_LABORAL_24_MESES');
        }
        if (months >= 6) {
          facts.push('FACT_ANTIGUEDAD_LABORAL_MINIMA');
        }
      },

      // Cuota proyectada vs ingresos
      // Acepta tanto porcentajes (0-100) como decimales (0-1)
      payment_to_income_ratio: (ratio: number) => {
        // Si el valor es mayor a 1, asumimos que es un porcentaje (0-100)
        // Si es menor o igual a 1, asumimos que es un decimal (0-1)
        const normalizedRatio = ratio > 1 ? ratio / 100 : ratio;
        
        if (normalizedRatio <= 0.30) {
          facts.push('FACT_CUOTA_MAX_30_INGRESOS');
        }
        if (normalizedRatio <= 0.40) {
          facts.push('FACT_CUOTA_MAX_40_INGRESOS');
        }
      },

      // Porcentaje inicial
      down_payment_percentage: (percentage: number) => {
        if (percentage >= 30) {
          facts.push('FACT_PORCENTAJE_INICIAL_30');
        }
      },


      // Ingresos del codeudor
      co_borrower_income: (income: number) => {
        const smmlv = 1300000;
        if (income >= 2 * smmlv) {
          facts.push('FACT_INGRESOS_CODEUDOR_2_SMMLV');
        }
      },

      // Actividad microempresarial
      is_microenterprise: (isMicro: boolean) => {
        if (isMicro) {
          facts.push('FACT_ACTIVIDAD_MICROEMPRESARIAL');
        }
      },

      // Actividad económica
      economic_activity: (activity: string) => {
        const highRiskActivities = ['juegos', 'casinos', 'cambios', 'remesas'];
        if (highRiskActivities.includes(activity.toLowerCase())) {
          facts.push('FACT_ACTIVIDAD_ALTO_RIESGO_SARLAFT');
        } else {
          facts.push('FACT_ACTIVIDAD_BAJO_RIESGO_SARLAFT');
        }
      },

      // Persona políticamente expuesta
      is_pep: (isPep: boolean) => {
        if (isPep) {
          facts.push('FACT_PERSONA_PEP');
        }
      },

      // Aprobación comité PEP
      pep_committee_approval: (approved: boolean) => {
        if (approved) {
          facts.push('FACT_APROBACION_COMITE_PEP');
        }
      },

      // Consultas recientes
      recent_inquiries: (count: number) => {
        if (count <= 3) {
          facts.push('FACT_CONSULTAS_ULTIMOS_30_DIAS_3');
        } else {
          facts.push('FACT_MULTIPLES_CONSULTAS');
        }
      },

      // Antigüedad como cliente
      customer_tenure_months: (months: number) => {
        if (months >= 24) {
          facts.push('FACT_ANTIGUEDAD_CLIENTE_24_MESES');
        }
      },

      // Cumplimiento histórico
      historical_compliance: (percentage: number) => {
        if (percentage >= 95) {
          facts.push('FACT_CUMPLIMIENTO_HISTORICO_95');
        }
      },

      // Empleado empresa convenio
      is_convention_employee: (isConvention: boolean) => {
        if (isConvention) {
          facts.push('FACT_EMPLEADO_EMPRESA_CONVENIO');
        }
      },

      // Descuento nómina autorizado
      payroll_discount_authorized: (authorized: boolean) => {
        if (authorized) {
          facts.push('FACT_DESCUENTO_NOMINA_AUTORIZADO');
        }
      },


      // Tipo de vinculación
      employment_type: (type: string) => {
        if (type === 'pensionado' || type === 'PENSIONADO') {
          facts.push('FACT_TIPO_VINCULACION_PENSIONADO');
        }
      },

      // Mesada de pensión
      pension_amount: (amount: number) => {
        const smmlv = 1300000;
        if (amount >= 2 * smmlv) {
          facts.push('FACT_MESADA_PENSION_2_SMMLV');
        }
      },

      // Pensión legal
      is_legal_pension: (isLegal: boolean) => {
        if (isLegal) {
          facts.push('FACT_PENSION_LEGAL');
        }
      }
    };

    // Campos requeridos que siempre deben procesarse
    const requiredFields = ['age', 'monthly_income', 'credit_score', 'employment_status', 'credit_purpose', 'requested_amount'];
    
    // Campos opcionales que solo se procesan si tienen un valor válido
    const optionalFields = [
      'debt_to_income_ratio', 'max_days_delinquency', 'employment_tenure_months',
      'payment_to_income_ratio', 'down_payment_percentage', 'co_borrower_income',
      'is_microenterprise', 'economic_activity', 'is_pep', 'pep_committee_approval',
      'recent_inquiries', 'customer_tenure_months', 'historical_compliance',
      'is_convention_employee', 'payroll_discount_authorized', 'employment_type',
      'pension_amount', 'is_legal_pension', 'has_co_borrower'
    ];

    // Aplicar mapeos
    for (const [key, mapper] of Object.entries(factMappings)) {
      const value = inputData[key];
      
      // Campos requeridos: siempre procesar si están definidos
      if (requiredFields.includes(key)) {
        if (value !== undefined && value !== null) {
          try {
            (mapper as Function)(value);
          } catch (error) {
            this.logger.warn(`Error mapeando campo requerido ${key}:`, error);
          }
        } else {
          this.logger.warn(`Campo requerido ${key} no está definido`);
        }
      } 
      // Campos opcionales: solo procesar si tienen un valor válido
      else if (optionalFields.includes(key)) {
        if (value !== undefined && value !== null) {
          // Para números opcionales, procesar incluso si es 0 (puede ser válido)
          // Para strings, ignorar strings vacíos
          // Para booleanos, procesar siempre
          const shouldProcess = 
            typeof value === 'boolean' || 
            typeof value === 'number' ||
            (typeof value === 'string' && value.trim() !== '');
          
          if (shouldProcess) {
            try {
              (mapper as Function)(value);
            } catch (error) {
              this.logger.warn(`Error mapeando campo opcional ${key}:`, error);
            }
          }
        }
      }
    }


    const executionTime = Date.now() - startTime;
    this.logger.debug(`Facts detectados: ${facts.length} en ${executionTime}ms`);

    return facts;
  }

  /**
   * Evalúa una regla específica contra los facts disponibles
   */
  async evaluateRule(rule: RuleDefinition, availableFacts: string[]): Promise<{
    applied: boolean;
    result: string;
    explanation: string;
    executionTime: number;
    conditions?: Record<string, any>;
  }> {
    const startTime = Date.now();

    // Separar condiciones requeridas y opcionales
    const requiredConditions = rule.conditions.filter(c => c.required);
    const optionalConditions = rule.conditions.filter(c => !c.required);

    // Construir objeto de condiciones evaluadas
    const conditionsEvaluated: Record<string, any> = {};
    rule.conditions.forEach(condition => {
      const factPresent = availableFacts.includes(condition.fact_code);
      conditionsEvaluated[condition.fact_code] = {
        operator: condition.operator,
        expected_value: condition.value,
        actual_present: factPresent,
        condition_met: condition.operator === 'not_equals' ? !factPresent : factPresent
      };
    });

    // Si hay condiciones requeridas, todas deben cumplirse
    if (requiredConditions.length > 0) {
      const metRequiredConditions = requiredConditions.filter(condition => {
        const factPresent = availableFacts.includes(condition.fact_code);
        // Manejar operadores not_equals
        if (condition.operator === 'not_equals') {
          return !factPresent; // Si el fact NO está presente, la condición se cumple
        }
        return factPresent;
      });

      const allRequiredMet = metRequiredConditions.length === requiredConditions.length;
      const executionTime = Date.now() - startTime;

      // Si la regla tiene invert_logic, invertir el resultado
      if (rule.invert_logic) {
        if (allRequiredMet) {
          return {
            applied: true,
            result: 'FAIL', // Invertido: si los facts están presentes, falla
            explanation: `Regla ${rule.code} detectó condición problemática: ${rule.description}`,
            executionTime,
            conditions: conditionsEvaluated
          };
        } else {
          return {
            applied: false,
            result: 'PASS', // Invertido: si los facts NO están presentes, pasa
            explanation: `Regla ${rule.code} no aplicable: Condiciones problemáticas no presentes`,
            executionTime,
            conditions: conditionsEvaluated
          };
        }
      }

      // Lógica normal
      if (allRequiredMet) {
        return {
          applied: true,
          result: 'PASS',
          explanation: `Regla ${rule.code} aplicada: ${rule.description}`,
          executionTime,
          conditions: conditionsEvaluated
        };
      } else {
        const missingFacts = requiredConditions
          .filter(c => {
            const factPresent = availableFacts.includes(c.fact_code);
            if (c.operator === 'not_equals') {
              return factPresent; // Si está presente cuando no debería, es un problema
            }
            return !factPresent;
          })
          .map(c => c.fact_code);
        
        return {
          applied: false,
          result: 'FAIL',
          explanation: `Regla ${rule.code} no aplicada: Faltan facts requeridos: ${missingFacts.join(', ')}`,
          executionTime,
          conditions: conditionsEvaluated
        };
      }
    }
    
    // Si solo hay condiciones opcionales, solo evaluar si al menos una está presente
    if (optionalConditions.length > 0) {
      const presentOptionalConditions = optionalConditions.filter(condition => {
        const factPresent = availableFacts.includes(condition.fact_code);
        // Manejar operadores not_equals
        if (condition.operator === 'not_equals') {
          return !factPresent; // Si el fact NO está presente, la condición se cumple
        }
        return factPresent;
      });

      // Si ninguna condición opcional está presente, la regla no se aplica
      if (presentOptionalConditions.length === 0) {
        return {
          applied: false,
          result: 'NOT_APPLICABLE',
          explanation: `Regla ${rule.code} no aplicable: No hay facts relacionados presentes`,
          executionTime: Date.now() - startTime,
          conditions: conditionsEvaluated
        };
      }

      const executionTime = Date.now() - startTime;

      // Si la regla usa lógica OR, pasa si AL MENOS UNA condición se cumple
      if (rule.use_or_logic) {
        if (presentOptionalConditions.length > 0) {
          return {
            applied: true,
            result: 'PASS',
            explanation: `Regla ${rule.code} aplicada: ${rule.description} (al menos una condición cumplida)`,
            executionTime,
            conditions: conditionsEvaluated
          };
        } else {
          return {
            applied: false,
            result: 'FAIL',
            explanation: `Regla ${rule.code} no aplicada: Ninguna condición se cumple`,
            executionTime,
            conditions: conditionsEvaluated
          };
        }
      }

      // Lógica AND: todas las condiciones opcionales presentes deben cumplirse
      const allPresentMet = presentOptionalConditions.length === optionalConditions.length;

      if (allPresentMet) {
        return {
          applied: true,
          result: 'PASS',
          explanation: `Regla ${rule.code} aplicada: ${rule.description}`,
          executionTime,
          conditions: conditionsEvaluated
        };
      } else {
        const missingFacts = optionalConditions
          .filter(c => {
            const factPresent = availableFacts.includes(c.fact_code);
            if (c.operator === 'not_equals') {
              return factPresent; // Si está presente cuando no debería, es un problema
            }
            return !factPresent;
          })
          .map(c => c.fact_code);
        
        return {
          applied: false,
          result: 'FAIL',
          explanation: `Regla ${rule.code} no aplicada: Faltan facts opcionales: ${missingFacts.join(', ')}`,
          executionTime,
          conditions: conditionsEvaluated
        };
      }
    }

    // Si no hay condiciones, la regla siempre pasa
    return {
      applied: true,
      result: 'PASS',
      explanation: `Regla ${rule.code} aplicada: ${rule.description}`,
      executionTime: Date.now() - startTime,
      conditions: conditionsEvaluated
    };
  }

  /**
   * Ejecuta el algoritmo de encadenamiento hacia adelante
   */
  async executeForwardChaining(inputData: any): Promise<{
    facts: string[];
    ruleExecutions: any[];
    failures: string[];
    riskProfile: string;
    recommendedProducts: string[];
    specialConditions: string[];
  }> {
    const startTime = Date.now();
    this.logger.debug('Iniciando encadenamiento hacia adelante...');

    // 1. Convertir datos de entrada a facts
    const facts = await this.convertInputToFacts(inputData);
    
    // 2. Obtener reglas del sistema desde la base de datos
    const rules = await this.getSystemRulesFromDB();
    
    // 3. Ejecutar reglas en orden de prioridad
    const ruleExecutions: any[] = [];
    const failures: string[] = [];
    const riskProfile: string[] = [];
    const recommendedProducts: string[] = [];
    const specialConditions: string[] = [];

    // Ordenar reglas por prioridad
    const sortedRules = rules.sort((a, b) => a.priority - b.priority);

    for (const rule of sortedRules) {
      const evaluation = await this.evaluateRule(rule, facts);
      
      ruleExecutions.push({
        rule_code: rule.code,
        rule_name: rule.name,
        category: rule.category,
        result: evaluation.result,
        explanation: evaluation.explanation,
        execution_time_ms: evaluation.executionTime,
        priority: rule.priority,
        rule_conditions: evaluation.conditions || {}
      });

      // Log detallado para depuración
      if (evaluation.result === 'FAIL' || (evaluation.applied && evaluation.result === 'PASS')) {
        this.logger.debug(`Regla ${rule.code} (${rule.category}): ${evaluation.result} - ${evaluation.explanation}`);
      }

      if (evaluation.applied && evaluation.result === 'PASS') {
        // Si la regla pasa (PASS), ejecutar acciones de éxito
        // Si la regla define un perfil de riesgo, agregarlo y generar el fact correspondiente
        if (rule.success_action?.startsWith('RIESGO_')) {
          riskProfile.push(rule.success_action);
          // Generar el fact de perfil de riesgo para que otras reglas puedan usarlo
          const riskFactCode = rule.success_action === 'RIESGO_BAJO' ? 'FACT_PERFIL_RIESGO_BAJO' :
                              rule.success_action === 'RIESGO_MEDIO' ? 'FACT_PERFIL_RIESGO_MEDIO' :
                              rule.success_action === 'RIESGO_ALTO' ? 'FACT_PERFIL_RIESGO_ALTO' : null;
          if (riskFactCode && !facts.includes(riskFactCode)) {
            facts.push(riskFactCode);
            this.logger.debug(`Fact generado: ${riskFactCode} (regla ${rule.code})`);
          }
        }
        
        if (rule.success_action && !rule.success_action.startsWith('RIESGO_')) {
          recommendedProducts.push(rule.success_action);
        }
        
        if (rule.category === 'ESPECIAL' && rule.success_action) {
          specialConditions.push(rule.success_action);
        }
      } else if (evaluation.result === 'FAIL' && evaluation.applied) {
        if (rule.failure_detected) {
          failures.push(rule.failure_detected);
          this.logger.debug(`Failure agregado: ${rule.failure_detected} (regla ${rule.code})`);
        }
      }
    }

    // Si no se determinó un perfil de riesgo por las reglas, calcularlo con los datos disponibles
    let finalRiskProfile = riskProfile[0] || null;
    
    if (!finalRiskProfile) {
      // Intentar determinar el perfil de riesgo basándose en los facts disponibles
      const hasScore700Plus = facts.includes('FACT_SCORE_700_PLUS');
      const hasScore500_699 = facts.includes('FACT_SCORE_500_699');
      const hasScore300_499 = facts.includes('FACT_SCORE_300_499');
      const hasMora30 = facts.includes('FACT_MORA_MAX_30_DIAS');
      const hasMora60 = facts.includes('FACT_MORA_MAX_60_DIAS');
      
      // Determinar perfil de riesgo basado en score y mora disponibles
      if (hasScore700Plus && hasMora30) {
        finalRiskProfile = 'RIESGO_BAJO';
        facts.push('FACT_PERFIL_RIESGO_BAJO');
        this.logger.debug('Perfil de riesgo determinado por datos disponibles: RIESGO_BAJO');
      } else if (hasScore500_699 && hasMora60) {
        finalRiskProfile = 'RIESGO_MEDIO';
        facts.push('FACT_PERFIL_RIESGO_MEDIO');
        this.logger.debug('Perfil de riesgo determinado por datos disponibles: RIESGO_MEDIO');
      } else if (hasScore300_499) {
        finalRiskProfile = 'RIESGO_ALTO';
        facts.push('FACT_PERFIL_RIESGO_ALTO');
        this.logger.debug('Perfil de riesgo determinado por datos disponibles: RIESGO_ALTO');
      } else if (hasScore700Plus) {
        // Si tiene score alto pero mora mayor, considerar medio
        finalRiskProfile = 'RIESGO_MEDIO';
        facts.push('FACT_PERFIL_RIESGO_MEDIO');
        this.logger.debug('Perfil de riesgo determinado por datos disponibles: RIESGO_MEDIO (score alto pero mora mayor)');
      } else if (hasScore500_699) {
        // Si tiene score medio pero mora mayor, considerar alto
        finalRiskProfile = 'RIESGO_ALTO';
        facts.push('FACT_PERFIL_RIESGO_ALTO');
        this.logger.debug('Perfil de riesgo determinado por datos disponibles: RIESGO_ALTO (score medio pero mora mayor)');
      } else {
        // Si no hay datos suficientes de score, intentar determinar por mora
        if (facts.includes('FACT_MORA_RECIENTE_SIGNIFICATIVA')) {
          finalRiskProfile = 'RIESGO_ALTO';
          facts.push('FACT_PERFIL_RIESGO_ALTO');
          this.logger.debug('Perfil de riesgo determinado por mora significativa: RIESGO_ALTO');
        } else if (hasMora30 || hasMora60) {
          // Si hay mora controlada pero no hay score, considerar medio-alto
          finalRiskProfile = 'RIESGO_ALTO';
          facts.push('FACT_PERFIL_RIESGO_ALTO');
          this.logger.debug('Perfil de riesgo determinado por mora controlada sin score: RIESGO_ALTO');
        } else {
          finalRiskProfile = 'NO_DETERMINADO';
          this.logger.debug('No se pudo determinar perfil de riesgo: datos insuficientes');
        }
      }
    }

    const totalTime = Date.now() - startTime;
    this.logger.log(`Encadenamiento hacia adelante completado en ${totalTime}ms - Facts: ${facts.length}, Reglas: ${ruleExecutions.length}, Failures: ${failures.length}, Riesgo: ${finalRiskProfile}`);
    if (failures.length > 0) {
      this.logger.warn(`Failures detectados (${failures.length}): ${failures.join(', ')}`);
    }

    return {
      facts,
      ruleExecutions,
      failures,
      riskProfile: finalRiskProfile,
      recommendedProducts,
      specialConditions
    };
  }
}
