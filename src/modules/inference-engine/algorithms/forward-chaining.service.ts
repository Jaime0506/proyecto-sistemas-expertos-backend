import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fact } from '../../facts/entities/fact.entity';
import { Failure } from '../../failures/entities/failure.entity';
import { FactsFailure } from '../../facts-failure/entities/facts-failure.entity';

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
  constructor(
    @InjectRepository(Fact)
    private factRepository: Repository<Fact>,
    @InjectRepository(Failure)
    private failureRepository: Repository<Failure>,
    @InjectRepository(FactsFailure)
    private factsFailureRepository: Repository<FactsFailure>,
  ) {}

  /**
   * Definición de todas las reglas del sistema experto basadas en R001-R052
   */
  private getSystemRules(): RuleDefinition[] {
    return [
      // REGLAS DE ADMISIBILIDAD GENERAL (R001-R005)
      {
        code: 'R001',
        name: 'Verificación de Edad',
        category: 'ADMISIBILIDAD',
        priority: 1,
        conditions: [
          { fact_code: 'FACT_EDAD_18_75', operator: 'equals', value: true, required: true }
        ],
        failure_detected: 'FALLA_EDAD_FUERA_RANGO',
        description: 'Verificar que la edad esté entre 18 y 75 años'
      },
      {
        code: 'R002',
        name: 'Verificación de Ingresos Mínimos',
        category: 'ADMISIBILIDAD',
        priority: 2,
        conditions: [
          { fact_code: 'FACT_INGRESOS_MIN_1_SMMLV', operator: 'equals', value: true, required: true }
        ],
        failure_detected: 'FALLA_INGRESOS_INSUFICIENTES',
        description: 'Verificar ingresos mínimos de 1 SMMLV'
      },
      {
        code: 'R003',
        name: 'Verificación de Score Crediticio',
        category: 'ADMISIBILIDAD',
        priority: 3,
        conditions: [
          { fact_code: 'FACT_SCORE_MIN_300', operator: 'equals', value: true, required: true }
        ],
        failure_detected: 'FALLA_SCORE_INSUFICIENTE',
        description: 'Verificar score crediticio mínimo de 300 puntos'
      },
      {
        code: 'R004',
        name: 'Verificación de Nivel de Endeudamiento',
        category: 'ADMISIBILIDAD',
        priority: 4,
        conditions: [
          { fact_code: 'FACT_ENDEUDAMIENTO_MAX_50', operator: 'equals', value: true, required: true }
        ],
        failure_detected: 'FALLA_ENDEUDAMIENTO_EXCESIVO',
        description: 'Verificar que el endeudamiento no exceda el 50%'
      },
      {
        code: 'R005',
        name: 'Verificación de Mora Reciente',
        category: 'ADMISIBILIDAD',
        priority: 5,
        conditions: [
          { fact_code: 'FACT_MORA_MAX_90_DIAS', operator: 'equals', value: true, required: true }
        ],
        failure_detected: 'FALLA_MORA_RECIENTE_SIGNIFICATIVA',
        description: 'Verificar que la mora no exceda 90 días'
      },

      // REGLAS DE CLASIFICACIÓN DE RIESGO (R010-R012)
      {
        code: 'R010',
        name: 'Clasificación Riesgo Bajo',
        category: 'RIESGO',
        priority: 10,
        conditions: [
          { fact_code: 'FACT_SCORE_700_PLUS', operator: 'equals', value: true, required: true },
          { fact_code: 'FACT_MORA_MAX_30_DIAS', operator: 'equals', value: true, required: true }
        ],
        success_action: 'RIESGO_BAJO',
        description: 'Clasificar como riesgo bajo'
      },
      {
        code: 'R011',
        name: 'Clasificación Riesgo Medio',
        category: 'RIESGO',
        priority: 11,
        conditions: [
          { fact_code: 'FACT_SCORE_500_699', operator: 'equals', value: true, required: true },
          { fact_code: 'FACT_MORA_MAX_60_DIAS', operator: 'equals', value: true, required: true }
        ],
        success_action: 'RIESGO_MEDIO',
        description: 'Clasificar como riesgo medio'
      },
      {
        code: 'R012',
        name: 'Clasificación Riesgo Alto',
        category: 'RIESGO',
        priority: 12,
        conditions: [
          { fact_code: 'FACT_SCORE_300_499', operator: 'equals', value: true, required: true }
        ],
        success_action: 'RIESGO_ALTO',
        description: 'Clasificar como riesgo alto'
      },

      // REGLAS DE RECOMENDACIÓN DE PRODUCTOS - BAJO RIESGO (R020-R023)
      {
        code: 'R020',
        name: 'Crédito Hipotecario',
        category: 'PRODUCTO',
        priority: 20,
        conditions: [
          { fact_code: 'FACT_PERFIL_RIESGO_BAJO', operator: 'equals', value: true, required: true },
          { fact_code: 'FACT_FINALIDAD_VIVIENDA', operator: 'equals', value: true, required: true },
          { fact_code: 'FACT_INGRESOS_MIN_4_SMMLV', operator: 'equals', value: true, required: true },
          { fact_code: 'FACT_CUOTA_MAX_30_INGRESOS', operator: 'equals', value: true, required: true }
        ],
        success_action: 'CREDITO_HIPOTECARIO',
        description: 'Recomendar crédito hipotecario'
      },
      {
        code: 'R021',
        name: 'Crédito Vehículo',
        category: 'PRODUCTO',
        priority: 21,
        conditions: [
          { fact_code: 'FACT_PERFIL_RIESGO_BAJO', operator: 'equals', value: true, required: true },
          { fact_code: 'FACT_FINALIDAD_VEHICULO', operator: 'equals', value: true, required: true },
          { fact_code: 'FACT_INGRESOS_MIN_3_SMMLV', operator: 'equals', value: true, required: true },
          { fact_code: 'FACT_CUOTA_MAX_40_INGRESOS', operator: 'equals', value: true, required: true }
        ],
        success_action: 'CREDITO_VEHICULO',
        description: 'Recomendar crédito vehicular'
      },
      {
        code: 'R022',
        name: 'Crédito Libre Inversión',
        category: 'PRODUCTO',
        priority: 22,
        conditions: [
          { fact_code: 'FACT_PERFIL_RIESGO_BAJO', operator: 'equals', value: true, required: true },
          { fact_code: 'FACT_INGRESOS_MIN_3_SMMLV', operator: 'equals', value: true, required: true },
          { fact_code: 'FACT_ANTIGUEDAD_LABORAL_12_MESES', operator: 'equals', value: true, required: true }
        ],
        success_action: 'CREDITO_LIBRE_INVERSION',
        description: 'Recomendar crédito de libre inversión'
      },
      {
        code: 'R023',
        name: 'Tarjeta de Crédito',
        category: 'PRODUCTO',
        priority: 23,
        conditions: [
          { fact_code: 'FACT_PERFIL_RIESGO_BAJO', operator: 'equals', value: true, required: true },
          { fact_code: 'FACT_INGRESOS_MIN_2_SMMLV', operator: 'equals', value: true, required: true }
        ],
        success_action: 'TARJETA_CREDITO',
        description: 'Recomendar tarjeta de crédito'
      },

      // REGLAS DE RECOMENDACIÓN DE PRODUCTOS - MEDIO RIESGO (R030-R032)
      {
        code: 'R030',
        name: 'Crédito Vehículo Condicionado',
        category: 'PRODUCTO',
        priority: 30,
        conditions: [
          { fact_code: 'FACT_PERFIL_RIESGO_MEDIO', operator: 'equals', value: true, required: true },
          { fact_code: 'FACT_FINALIDAD_VEHICULO', operator: 'equals', value: true, required: true },
          { fact_code: 'FACT_INGRESOS_MIN_4_SMMLV', operator: 'equals', value: true, required: true },
          { fact_code: 'FACT_PORCENTAJE_INICIAL_30', operator: 'equals', value: true, required: true }
        ],
        success_action: 'CREDITO_VEHICULO_CONDICIONADO',
        description: 'Recomendar crédito vehicular condicionado'
      },
      {
        code: 'R031',
        name: 'Crédito con Codeudor',
        category: 'PRODUCTO',
        priority: 31,
        conditions: [
          { fact_code: 'FACT_PERFIL_RIESGO_MEDIO', operator: 'equals', value: true, required: true },
          { fact_code: 'FACT_INGRESOS_MIN_2_SMMLV', operator: 'equals', value: true, required: true },
          { fact_code: 'FACT_CODEUDOR_DISPONIBLE', operator: 'equals', value: true, required: true },
          { fact_code: 'FACT_INGRESOS_CODEUDOR_2_SMMLV', operator: 'equals', value: true, required: true }
        ],
        success_action: 'CREDITO_CON_CODEUDOR',
        description: 'Recomendar crédito con codeudor'
      },
      {
        code: 'R032',
        name: 'Microcrédito',
        category: 'PRODUCTO',
        priority: 32,
        conditions: [
          { fact_code: 'FACT_PERFIL_RIESGO_MEDIO', operator: 'equals', value: true, required: true },
          { fact_code: 'FACT_INGRESOS_MIN_1_SMMLV', operator: 'equals', value: true, required: true },
          { fact_code: 'FACT_ACTIVIDAD_MICROEMPRESARIAL', operator: 'equals', value: true, required: true }
        ],
        success_action: 'MICROCREDITO',
        description: 'Recomendar microcrédito'
      },

      // REGLAS DE VALIDACIÓN NORMATIVA (R040-R042)
      // Estas reglas generan failures cuando los facts problemáticos están presentes
      {
        code: 'R040',
        name: 'Validación SARLAFT',
        category: 'NORMATIVA',
        priority: 40,
        conditions: [
          { fact_code: 'FACT_ACTIVIDAD_ALTO_RIESGO_SARLAFT', operator: 'equals', value: true, required: true }
        ],
        failure_detected: 'FALLA_ACTIVIDAD_ALTO_RIESGO_SARLAFT',
        description: 'Validar actividades de alto riesgo SARLAFT',
        // Esta regla falla cuando el fact está presente (invertir lógica)
        invert_logic: true
      },
      {
        code: 'R041',
        name: 'Validación PEP',
        category: 'NORMATIVA',
        priority: 41,
        conditions: [
          { fact_code: 'FACT_PERSONA_PEP', operator: 'equals', value: true, required: true },
          { fact_code: 'FACT_APROBACION_COMITE_PEP', operator: 'not_equals', value: true, required: false }
        ],
        failure_detected: 'FALLA_PERSONA_PEP_SIN_APROBACION',
        description: 'Validar personas políticamente expuestas',
        // Esta regla falla cuando PEP está presente pero sin aprobación
        invert_logic: true
      },
      {
        code: 'R042',
        name: 'Múltiples Consultas',
        category: 'NORMATIVA',
        priority: 42,
        conditions: [
          { fact_code: 'FACT_MULTIPLES_CONSULTAS', operator: 'equals', value: true, required: true }
        ],
        failure_detected: 'FALLA_MULTIPLES_CONSULTAS',
        description: 'Detectar múltiples consultas simultáneas',
        // Esta regla falla cuando el fact está presente (invertir lógica)
        invert_logic: true
      },

      // REGLAS DE CONDICIONES ESPECIALES (R050-R052)
      {
        code: 'R050',
        name: 'Cliente Preferencial',
        category: 'ESPECIAL',
        priority: 50,
        conditions: [
          { fact_code: 'FACT_ANTIGUEDAD_CLIENTE_24_MESES', operator: 'equals', value: true, required: true },
          { fact_code: 'FACT_CUMPLIMIENTO_HISTORICO_95', operator: 'equals', value: true, required: true }
        ],
        success_action: 'CLIENTE_PREFERENCIAL',
        description: 'Aplicar beneficios de cliente preferencial'
      },
      {
        code: 'R051',
        name: 'Empleado Empresa Convenio',
        category: 'ESPECIAL',
        priority: 51,
        conditions: [
          { fact_code: 'FACT_EMPLEADO_EMPRESA_CONVENIO', operator: 'equals', value: true, required: true },
          { fact_code: 'FACT_DESCUENTO_NOMINA_AUTORIZADO', operator: 'equals', value: true, required: true }
        ],
        success_action: 'CREDITO_NOMINA',
        description: 'Aplicar crédito de nómina'
      },
      {
        code: 'R052',
        name: 'Pensionado',
        category: 'ESPECIAL',
        priority: 52,
        conditions: [
          { fact_code: 'FACT_TIPO_VINCULACION_PENSIONADO', operator: 'equals', value: true, required: true },
          { fact_code: 'FACT_MESADA_PENSION_2_SMMLV', operator: 'equals', value: true, required: true },
          { fact_code: 'FACT_PENSION_LEGAL', operator: 'equals', value: true, required: true }
        ],
        success_action: 'CREDITO_PENSIONADOS',
        description: 'Aplicar crédito para pensionados'
      },

      // REGLAS DE RECOMENDACIÓN DE PRODUCTOS - ALTO RIESGO (R033-R035)
      {
        code: 'R033',
        name: 'Crédito Vehículo Alto Riesgo',
        category: 'PRODUCTO',
        priority: 33,
        conditions: [
          { fact_code: 'FACT_PERFIL_RIESGO_ALTO', operator: 'equals', value: true, required: true },
          { fact_code: 'FACT_FINALIDAD_VEHICULO', operator: 'equals', value: true, required: true },
          { fact_code: 'FACT_INGRESOS_MIN_5_SMMLV', operator: 'equals', value: true, required: true },
          { fact_code: 'FACT_ENGANCHE_MIN_50', operator: 'equals', value: true, required: true }
        ],
        success_action: 'CREDITO_VEHICULO_ALTO_RIESGO',
        description: 'Recomendar crédito vehicular para alto riesgo'
      },
      {
        code: 'R034',
        name: 'Microcrédito Alto Riesgo',
        category: 'PRODUCTO',
        priority: 34,
        conditions: [
          { fact_code: 'FACT_PERFIL_RIESGO_ALTO', operator: 'equals', value: true, required: true },
          { fact_code: 'FACT_INGRESOS_MIN_2_SMMLV', operator: 'equals', value: true, required: true },
          { fact_code: 'FACT_ACTIVIDAD_MICROEMPRESARIAL', operator: 'equals', value: true, required: true }
        ],
        success_action: 'MICROCREDITO_ALTO_RIESGO',
        description: 'Recomendar microcrédito para alto riesgo'
      },
      {
        code: 'R035',
        name: 'Tarjeta de Crédito Condicionada',
        category: 'PRODUCTO',
        priority: 35,
        conditions: [
          { fact_code: 'FACT_PERFIL_RIESGO_ALTO', operator: 'equals', value: true, required: true },
          { fact_code: 'FACT_INGRESOS_MIN_3_SMMLV', operator: 'equals', value: true, required: true },
          { fact_code: 'FACT_ANTIGUEDAD_LABORAL_24_MESES', operator: 'equals', value: true, required: true }
        ],
        success_action: 'TARJETA_CREDITO_CONDICIONADA',
        description: 'Recomendar tarjeta de crédito condicionada'
      },

      // REGLAS DE VALIDACIÓN ADICIONAL (R043-R048)
      // Estas reglas solo se ejecutan si los facts requeridos están presentes
      // Si no hay datos para evaluarlas, no generan failures
      {
        code: 'R043',
        name: 'Validación de Documentos',
        category: 'VALIDACION',
        priority: 43,
        conditions: [
          { fact_code: 'FACT_DOCUMENTOS_COMPLETOS', operator: 'equals', value: true, required: false },
          { fact_code: 'FACT_DOCUMENTOS_VALIDOS', operator: 'equals', value: true, required: false }
        ],
        failure_detected: 'FALLA_DOCUMENTOS_INCOMPLETOS',
        description: 'Validar completitud y validez de documentos'
      },
      {
        code: 'R044',
        name: 'Validación de Referencias',
        category: 'VALIDACION',
        priority: 44,
        conditions: [
          { fact_code: 'FACT_REFERENCIAS_VERIFICADAS', operator: 'equals', value: true, required: false },
          { fact_code: 'FACT_REFERENCIAS_POSITIVAS', operator: 'equals', value: true, required: false }
        ],
        failure_detected: 'FALLA_REFERENCIAS_NEGATIVAS',
        description: 'Validar referencias personales y comerciales'
      },
      {
        code: 'R045',
        name: 'Validación de Garantías',
        category: 'VALIDACION',
        priority: 45,
        conditions: [
          { fact_code: 'FACT_GARANTIAS_SUFICIENTES', operator: 'equals', value: true, required: false },
          { fact_code: 'FACT_GARANTIAS_AVALUADAS', operator: 'equals', value: true, required: false }
        ],
        failure_detected: 'FALLA_GARANTIAS_INSUFICIENTES',
        description: 'Validar suficiencia y avalúo de garantías'
      },
      {
        code: 'R046',
        name: 'Validación de Historial Crediticio',
        category: 'VALIDACION',
        priority: 46,
        conditions: [
          { fact_code: 'FACT_HISTORIAL_CREDITICIO_POSITIVO', operator: 'equals', value: true, required: false },
          { fact_code: 'FACT_CUMPLIMIENTO_PAGOS', operator: 'equals', value: true, required: false }
        ],
        failure_detected: 'FALLA_HISTORIAL_CREDITICIO_NEGATIVO',
        description: 'Validar historial crediticio y cumplimiento de pagos'
      },
      {
        code: 'R047',
        name: 'Validación de Capacidad de Pago',
        category: 'VALIDACION',
        priority: 47,
        conditions: [
          { fact_code: 'FACT_CAPACIDAD_PAGO_DEMOSTRADA', operator: 'equals', value: true, required: false },
          { fact_code: 'FACT_MARGEN_PAGO_SUFICIENTE', operator: 'equals', value: true, required: false }
        ],
        failure_detected: 'FALLA_CAPACIDAD_PAGO_INSUFICIENTE',
        description: 'Validar capacidad de pago del solicitante'
      },
      {
        code: 'R048',
        name: 'Validación de Estabilidad Laboral',
        category: 'VALIDACION',
        priority: 48,
        conditions: [
          { fact_code: 'FACT_ESTABILIDAD_LABORAL', operator: 'equals', value: true, required: false },
          { fact_code: 'FACT_ANTIGUEDAD_LABORAL_MINIMA', operator: 'equals', value: true, required: false }
        ],
        failure_detected: 'FALLA_ESTABILIDAD_LABORAL_INSUFICIENTE',
        description: 'Validar estabilidad y antigüedad laboral',
        // Esta regla pasa si AL MENOS UNA condición se cumple (lógica OR)
        use_or_logic: true
      },

      // REGLAS DE EXPLICABILIDAD (R060-R061)
      {
        code: 'R060',
        name: 'Generación de Justificación',
        category: 'EXPLICABILIDAD',
        priority: 60,
        conditions: [
          { fact_code: 'FACT_DECISION_TOMADA', operator: 'equals', value: true, required: true }
        ],
        success_action: 'GENERAR_EXPLICACION_DETALLADA',
        description: 'Generar explicación detallada de la decisión'
      },
      {
        code: 'R061',
        name: 'Trazabilidad de Decisiones',
        category: 'EXPLICABILIDAD',
        priority: 61,
        conditions: [
          { fact_code: 'FACT_EVALUACION_COMPLETADA', operator: 'equals', value: true, required: true }
        ],
        success_action: 'REGISTRAR_TRAZABILIDAD',
        description: 'Registrar trazabilidad completa de la evaluación'
      }
    ];
  }

  /**
   * Convierte los datos de entrada del usuario en facts del sistema
   */
  async convertInputToFacts(inputData: any): Promise<string[]> {
    const facts: string[] = [];
    const startTime = Date.now();

    console.log('🔄 Convirtiendo datos de entrada a facts...');
    console.log('📥 Datos recibidos:', JSON.stringify(inputData, null, 2));

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

      // Endeudamiento
      // Acepta tanto porcentajes (0-100) como decimales (0-1)
      debt_to_income_ratio: (ratio: number) => {
        // Si el valor es mayor a 1, asumimos que es un porcentaje (0-100)
        // Si es menor o igual a 1, asumimos que es un decimal (0-1)
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
            console.log(`  🔍 Procesando campo requerido ${key}:`, value);
            (mapper as Function)(value);
          } catch (error) {
            console.warn(`⚠️ Error mapeando ${key}:`, error);
          }
        } else {
          console.warn(`⚠️ Campo requerido ${key} no está definido`);
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
              console.log(`  🔍 Procesando campo opcional ${key}:`, value);
              (mapper as Function)(value);
            } catch (error) {
              console.warn(`⚠️ Error mapeando ${key}:`, error);
            }
          } else {
            console.log(`  ⏭️  Omitiendo ${key} (string vacío):`, value);
          }
        } else {
          console.log(`  ⏭️  Omitiendo ${key} (undefined o null)`);
        }
      }
    }


    const executionTime = Date.now() - startTime;
    console.log(`✅ Facts detectados (${facts.length}):`, facts);
    console.log(`⏱️ Tiempo de conversión: ${executionTime}ms`);

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
  }> {
    const startTime = Date.now();

    // Separar condiciones requeridas y opcionales
    const requiredConditions = rule.conditions.filter(c => c.required);
    const optionalConditions = rule.conditions.filter(c => !c.required);

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
            executionTime
          };
        } else {
          return {
            applied: false,
            result: 'PASS', // Invertido: si los facts NO están presentes, pasa
            explanation: `Regla ${rule.code} no aplicable: Condiciones problemáticas no presentes`,
            executionTime
          };
        }
      }

      // Lógica normal
      if (allRequiredMet) {
        return {
          applied: true,
          result: 'PASS',
          explanation: `Regla ${rule.code} aplicada: ${rule.description}`,
          executionTime
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
          executionTime
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
          executionTime: Date.now() - startTime
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
            executionTime
          };
        } else {
          return {
            applied: false,
            result: 'FAIL',
            explanation: `Regla ${rule.code} no aplicada: Ninguna condición se cumple`,
            executionTime
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
          executionTime
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
          executionTime
        };
      }
    }

    // Si no hay condiciones, la regla siempre pasa
    return {
      applied: true,
      result: 'PASS',
      explanation: `Regla ${rule.code} aplicada: ${rule.description}`,
      executionTime: Date.now() - startTime
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
    console.log('🚀 Iniciando encadenamiento hacia adelante...');

    // 1. Convertir datos de entrada a facts
    const facts = await this.convertInputToFacts(inputData);
    
    // 2. Obtener reglas del sistema
    const rules = this.getSystemRules();
    
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
        priority: rule.priority
      });

      if (evaluation.applied && evaluation.result === 'PASS') {
        // Si la regla pasa (PASS), ejecutar acciones de éxito
        // Si la regla define un perfil de riesgo
        if (rule.success_action?.startsWith('RIESGO_')) {
          riskProfile.push(rule.success_action);
        }
        
        // Si la regla recomienda un producto
        if (rule.success_action && !rule.success_action.startsWith('RIESGO_')) {
          recommendedProducts.push(rule.success_action);
        }
        
        // Si la regla aplica condiciones especiales
        if (rule.category === 'ESPECIAL' && rule.success_action) {
          specialConditions.push(rule.success_action);
        }
      } else if (evaluation.result === 'FAIL') {
        // Si la regla falla (FAIL), agregar el failure detectado
        if (rule.failure_detected) {
          failures.push(rule.failure_detected);
        }
      }
      // Si result es 'NOT_APPLICABLE', no hacemos nada (no generamos failure)
    }

    const totalTime = Date.now() - startTime;
    console.log(`✅ Encadenamiento hacia adelante completado en ${totalTime}ms`);
    console.log(`📊 Resultados:`, {
      facts: facts.length,
      ruleExecutions: ruleExecutions.length,
      failures: failures.length,
      riskProfile: riskProfile[0] || 'NO_DETERMINADO',
      recommendedProducts: recommendedProducts.length,
      specialConditions: specialConditions.length
    });
    if (failures.length > 0) {
      console.log(`❌ Failures detectados (${failures.length}):`, failures);
    }

    return {
      facts,
      ruleExecutions,
      failures,
      riskProfile: riskProfile[0] || 'NO_DETERMINADO',
      recommendedProducts,
      specialConditions
    };
  }
}
