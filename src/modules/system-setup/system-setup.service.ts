import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fact } from '../facts/entities/fact.entity';
import { Failure } from '../failures/entities/failure.entity';
import { FactsFailure } from '../facts-failure/entities/facts-failure.entity';

@Injectable()
export class SystemSetupService {
  constructor(
    @InjectRepository(Fact)
    private factRepository: Repository<Fact>,
    @InjectRepository(Failure)
    private failureRepository: Repository<Failure>,
    @InjectRepository(FactsFailure)
    private factsFailureRepository: Repository<FactsFailure>,
  ) {}

  async populateSystemFacts(): Promise<void> {
    console.log('🔄 Poblando facts del sistema experto...');

    const systemFacts = [
      // FACTS DE ADMISIBILIDAD GENERAL (R001-R005)
      { code: 'FACT_EDAD_18_75', description: 'Edad del solicitante entre 18 y 75 años' },
      { code: 'FACT_EDAD_MENOR_18', description: 'Edad del solicitante menor a 18 años' },
      { code: 'FACT_EDAD_MAYOR_75', description: 'Edad del solicitante mayor a 75 años' },
      { code: 'FACT_INGRESOS_MIN_1_SMMLV', description: 'Ingresos mensuales netos igual o superior a 1 SMMLV' },
      { code: 'FACT_INGRESOS_INSUFICIENTES', description: 'Ingresos mensuales netos inferiores a 1 SMMLV' },
      { code: 'FACT_SCORE_MIN_300', description: 'Score en centrales de riesgo igual o superior a 300 puntos' },
      { code: 'FACT_SCORE_INSUFICIENTE', description: 'Score en centrales de riesgo inferior a 300 puntos' },
      { code: 'FACT_ENDEUDAMIENTO_MAX_50', description: 'Nivel de endeudamiento igual o inferior al 50% de ingresos' },
      { code: 'FACT_ENDEUDAMIENTO_EXCESIVO', description: 'Nivel de endeudamiento superior al 50% de ingresos' },
      { code: 'FACT_MORA_MAX_90_DIAS', description: 'Mora máxima en últimos 12 meses igual o inferior a 90 días' },
      { code: 'FACT_MORA_RECIENTE_SIGNIFICATIVA', description: 'Mora máxima en últimos 12 meses superior a 90 días' },

      // FACTS DE CLASIFICACIÓN DE RIESGO (R010-R012)
      { code: 'FACT_SCORE_700_PLUS', description: 'Score en centrales de riesgo igual o superior a 700 puntos' },
      { code: 'FACT_MORA_MAX_30_DIAS', description: 'Mora máxima en últimos 12 meses igual o inferior a 30 días' },
      { code: 'FACT_SCORE_500_699', description: 'Score en centrales de riesgo entre 500 y 699 puntos' },
      { code: 'FACT_MORA_MAX_60_DIAS', description: 'Mora máxima en últimos 12 meses igual o inferior a 60 días' },
      { code: 'FACT_SCORE_300_499', description: 'Score en centrales de riesgo entre 300 y 499 puntos' },
      { code: 'FACT_MORA_31_90_DIAS', description: 'Mora máxima en últimos 12 meses entre 31 y 90 días' },

      // FACTS DE RECOMENDACIÓN DE PRODUCTOS - BAJO RIESGO (R020-R023)
      { code: 'FACT_PERFIL_RIESGO_BAJO', description: 'Clasificación de perfil de riesgo bajo' },
      { code: 'FACT_FINALIDAD_VIVIENDA', description: 'Finalidad del crédito es para vivienda' },
      { code: 'FACT_INGRESOS_MIN_4_SMMLV', description: 'Ingresos mensuales netos igual o superior a 4 SMMLV' },
      { code: 'FACT_CUOTA_MAX_30_INGRESOS', description: 'Cuota proyectada igual o inferior al 30% de ingresos' },
      { code: 'FACT_FINALIDAD_VEHICULO', description: 'Finalidad del crédito es para vehículo' },
      { code: 'FACT_INGRESOS_MIN_3_SMMLV', description: 'Ingresos mensuales netos igual o superior a 3 SMMLV' },
      { code: 'FACT_CUOTA_MAX_40_INGRESOS', description: 'Cuota proyectada igual o inferior al 40% de ingresos' },
      { code: 'FACT_ANTIGUEDAD_LABORAL_12_MESES', description: 'Antigüedad laboral igual o superior a 12 meses' },
      { code: 'FACT_INGRESOS_MIN_2_SMMLV', description: 'Ingresos mensuales netos igual o superior a 2 SMMLV' },

      // FACTS DE RECOMENDACIÓN DE PRODUCTOS - MEDIO RIESGO (R030-R032)
      { code: 'FACT_PERFIL_RIESGO_MEDIO', description: 'Clasificación de perfil de riesgo medio' },
      { code: 'FACT_PORCENTAJE_INICIAL_30', description: 'Porcentaje de inicial igual o superior al 30%' },
      { code: 'FACT_CODEUDOR_DISPONIBLE', description: 'Codeudor disponible para el crédito' },
      { code: 'FACT_INGRESOS_CODEUDOR_2_SMMLV', description: 'Ingresos del codeudor igual o superior a 2 SMMLV' },
      { code: 'FACT_ACTIVIDAD_MICROEMPRESARIAL', description: 'Actividad microempresarial comprobada' },

      // FACTS DE VALIDACIÓN NORMATIVA (R040-R042)
      { code: 'FACT_ACTIVIDAD_ALTO_RIESGO_SARLAFT', description: 'Actividad económica en lista de alto riesgo SARLAFT' },
      { code: 'FACT_ACTIVIDAD_BAJO_RIESGO_SARLAFT', description: 'Actividad económica no está en lista de alto riesgo SARLAFT' },
      { code: 'FACT_PERSONA_PEP', description: 'Persona políticamente expuesta' },
      { code: 'FACT_APROBACION_COMITE_PEP', description: 'Aprobación de comité especial para PEP' },
      { code: 'FACT_CONSULTAS_ULTIMOS_30_DIAS_3', description: 'Número de consultas en últimos 30 días igual o inferior a 3' },
      { code: 'FACT_MULTIPLES_CONSULTAS', description: 'Múltiples consultas simultáneas detectadas' },

      // FACTS DE CONDICIONES ESPECIALES (R050-R052)
      { code: 'FACT_ANTIGUEDAD_CLIENTE_24_MESES', description: 'Antigüedad como cliente igual o superior a 24 meses' },
      { code: 'FACT_CUMPLIMIENTO_HISTORICO_95', description: 'Cumplimiento histórico igual o superior al 95%' },
      { code: 'FACT_EMPLEADO_EMPRESA_CONVENIO', description: 'Empleado de empresa con convenio' },
      { code: 'FACT_DESCUENTO_NOMINA_AUTORIZADO', description: 'Descuento por nómina autorizado' },
      { code: 'FACT_TIPO_VINCULACION_PENSIONADO', description: 'Tipo de vinculación es pensionado' },
      { code: 'FACT_MESADA_PENSION_2_SMMLV', description: 'Mesada de pensión igual o superior a 2 SMMLV' },
      { code: 'FACT_PENSION_LEGAL', description: 'Pensión legal comprobada' },

      // FACTS ADICIONALES PARA PRODUCTOS ESPECÍFICOS
      { code: 'FACT_VALOR_VIVIENDA_DISPONIBLE', description: 'Valor de vivienda disponible para crédito hipotecario' },
      { code: 'FACT_VALOR_VEHICULO_DISPONIBLE', description: 'Valor de vehículo disponible para crédito vehicular' },
      { code: 'FACT_INGRESOS_ADICIONALES', description: 'Ingresos adicionales comprobables' },
      { code: 'FACT_PATRIMONIO_LIQUIDO', description: 'Patrimonio líquido disponible' },
      { code: 'FACT_AHORROS_ULTIMOS_6_MESES', description: 'Ahorros en últimos 6 meses' },
      { code: 'FACT_ESTABILIDAD_LABORAL', description: 'Estabilidad laboral comprobada' },
      { code: 'FACT_SECTOR_ECONOMICO_ESTABLE', description: 'Sector económico estable' },
      { code: 'FACT_EMPRESA_GRANDE', description: 'Empresa de gran tamaño' },
      { code: 'FACT_VINCULACION_INDEFINIDA', description: 'Vinculación laboral indefinida' },
      { code: 'FACT_COMPORTAMIENTO_PAGO_EXCELENTE', description: 'Comportamiento de pago excelente en últimos 12 meses' },
      { code: 'FACT_SIN_MORA_ULTIMOS_12_MESES', description: 'Sin mora en últimos 12 meses' },
      { code: 'FACT_CONSULTAS_RECIENTES_MINIMAS', description: 'Consultas recientes mínimas en centrales de riesgo' },
      { code: 'FACT_SIN_REFINANCIACIONES', description: 'Sin refinanciaciones recientes' },
      { code: 'FACT_ZONA_BAJO_RIESGO', description: 'Zona geográfica de bajo riesgo' },
      { code: 'FACT_DOCUMENTACION_COMPLETA', description: 'Documentación completa y verificada' },
      { code: 'FACT_VERIFICACION_EXTERNA_OK', description: 'Verificación externa exitosa' },
      { code: 'FACT_CUMPLIMIENTO_NORMATIVO', description: 'Cumplimiento normativo verificado' },
    ];

    for (const factData of systemFacts) {
      const existingFact = await this.factRepository.findOne({ where: { code: factData.code } });
      if (!existingFact) {
        const fact = this.factRepository.create(factData);
        await this.factRepository.save(fact);
        console.log(`✅ Fact creado: ${factData.code}`);
      } else {
        console.log(`⚠️  Fact ya existe: ${factData.code}`);
      }
    }

    console.log('✅ Facts del sistema experto poblados exitosamente');
  }

  async populateSystemFailures(): Promise<void> {
    console.log('🔄 Poblando failures del sistema experto...');

    const systemFailures = [
      // FAILURES DE ADMISIBILIDAD GENERAL (R001-R005)
      { name: 'FALLA_EDAD_FUERA_RANGO', description: 'Edad fuera del rango permitido (18-75 años) - Código: ADM001' },
      { name: 'FALLA_INGRESOS_INSUFICIENTES', description: 'Ingresos insuficientes, mínimo requerido 1 SMMLV - Código: ADM002' },
      { name: 'FALLA_SCORE_INSUFICIENTE', description: 'Score crediticio insuficiente, mínimo requerido 300 puntos - Código: ADM003' },
      { name: 'FALLA_ENDEUDAMIENTO_EXCESIVO', description: 'Nivel de endeudamiento excesivo, máximo permitido 50% - Código: ADM004' },
      { name: 'FALLA_MORA_RECIENTE_SIGNIFICATIVA', description: 'Mora reciente significativa superior a 90 días - Código: ADM005' },

      // FAILURES DE CLASIFICACIÓN DE RIESGO (R010-R012)
      { name: 'FALLA_NO_CUMPLE_RIESGO_BAJO', description: 'No cumple criterios para clasificación de riesgo bajo' },
      { name: 'FALLA_NO_CUMPLE_RIESGO_MEDIO', description: 'No cumple criterios para clasificación de riesgo medio' },
      { name: 'FALLA_NO_CUMPLE_RIESGO_ALTO', description: 'No cumple criterios para clasificación de riesgo alto' },

      // FAILURES DE RECOMENDACIÓN DE PRODUCTOS - BAJO RIESGO (R020-R023)
      { name: 'FALLA_NO_APLICA_CREDITO_HIPOTECARIO', description: 'No aplica para crédito hipotecario - criterios no cumplidos' },
      { name: 'FALLA_NO_APLICA_CREDITO_VEHICULO', description: 'No aplica para crédito vehicular - criterios no cumplidos' },
      { name: 'FALLA_NO_APLICA_CREDITO_LIBRE_INVERSION', description: 'No aplica para crédito de libre inversión - criterios no cumplidos' },
      { name: 'FALLA_NO_APLICA_TARJETA_CREDITO', description: 'No aplica para tarjeta de crédito - criterios no cumplidos' },

      // FAILURES DE RECOMENDACIÓN DE PRODUCTOS - MEDIO RIESGO (R030-R032)
      { name: 'FALLA_NO_APLICA_CREDITO_VEHICULO_CONDICIONADO', description: 'No aplica para crédito vehicular condicionado - criterios no cumplidos' },
      { name: 'FALLA_NO_APLICA_CREDITO_CON_CODEUDOR', description: 'No aplica para crédito con codeudor - criterios no cumplidos' },
      { name: 'FALLA_NO_APLICA_MICROCREDITO', description: 'No aplica para microcrédito - criterios no cumplidos' },

      // FAILURES DE VALIDACIÓN NORMATIVA (R040-R042)
      { name: 'FALLA_ACTIVIDAD_ALTO_RIESGO_SARLAFT', description: 'Actividad económica de alto riesgo LA/FT - Código: NORM001' },
      { name: 'FALLA_PERSONA_PEP_SIN_APROBACION', description: 'Requiere aprobación de comité especial para PEP - Código: NORM002' },
      { name: 'FALLA_MULTIPLES_CONSULTAS', description: 'Múltiples consultas simultáneas detectadas - Código: NORM003' },

      // FAILURES DE CONDICIONES ESPECIALES (R050-R052)
      { name: 'FALLA_NO_APLICA_CLIENTE_PREFERENCIAL', description: 'No aplica para beneficios de cliente preferencial' },
      { name: 'FALLA_NO_APLICA_CREDITO_NOMINA', description: 'No aplica para crédito de nómina - no es empleado de empresa convenio' },
      { name: 'FALLA_NO_APLICA_CREDITO_PENSIONADOS', description: 'No aplica para crédito de pensionados - criterios no cumplidos' },

      // FAILURES ADICIONALES PARA CASOS ESPECIALES
      { name: 'FALLA_CASO_ZONA_GRIS', description: 'Caso en zona gris - requiere revisión manual' },
      { name: 'FALLA_INFORMACION_INCONSISTENTE', description: 'Información inconsistente detectada - requiere verificación adicional' },
      { name: 'FALLA_DOCUMENTACION_INCOMPLETA', description: 'Documentación incompleta o no verificable' },
      { name: 'FALLA_VERIFICACION_EXTERNA_FALLIDA', description: 'Verificación externa fallida' },
      { name: 'FALLA_CUMPLIMIENTO_NORMATIVO', description: 'No cumple con normativa aplicable' },
      { name: 'FALLA_CAPACIDAD_PAGO_INSUFICIENTE', description: 'Capacidad de pago insuficiente' },
      { name: 'FALLA_ESTABILIDAD_LABORAL_INSUFICIENTE', description: 'Estabilidad laboral insuficiente' },
      { name: 'FALLA_HISTORIAL_CREDITICIO_DEFICIENTE', description: 'Historial crediticio deficiente' },
      { name: 'FALLA_COMPORTAMIENTO_PAGO_DEFICIENTE', description: 'Comportamiento de pago deficiente' },
      { name: 'FALLA_CONCENTRACION_RIESGO', description: 'Concentración de riesgo detectada' },
      { name: 'FALLA_REFINANCIACIONES_EXCESIVAS', description: 'Refinanciaciones excesivas detectadas' },
      { name: 'FALLA_ZONA_ALTO_RIESGO', description: 'Zona geográfica de alto riesgo' },
      { name: 'FALLA_ACTIVIDAD_ECONOMICA_RIESGOSA', description: 'Actividad económica de alto riesgo' },
      { name: 'FALLA_CONSULTAS_EXCESIVAS', description: 'Consultas excesivas en centrales de riesgo' },
      { name: 'FALLA_MORA_HISTORICA_SIGNIFICATIVA', description: 'Mora histórica significativa' },
      { name: 'FALLA_OBLIGACIONES_VIGENTES_EXCESIVAS', description: 'Obligaciones vigentes excesivas' },
      { name: 'FALLA_PATRIMONIO_INSUFICIENTE', description: 'Patrimonio insuficiente para el monto solicitado' },
      { name: 'FALLA_AHORROS_INSUFICIENTES', description: 'Ahorros insuficientes' },
      { name: 'FALLA_INGRESOS_ADICIONALES_INSUFICIENTES', description: 'Ingresos adicionales insuficientes' },
      { name: 'FALLA_FINALIDAD_CREDITO_NO_VALIDA', description: 'Finalidad del crédito no válida' },
      { name: 'FALLA_MONTO_SOLICITADO_EXCESIVO', description: 'Monto solicitado excesivo para el perfil' },
      { name: 'FALLA_PLAZO_SOLICITADO_EXCESIVO', description: 'Plazo solicitado excesivo para el perfil' },
      { name: 'FALLA_GARANTIAS_INSUFICIENTES', description: 'Garantías insuficientes para el crédito' },
      { name: 'FALLA_CODEUDOR_NO_CALIFICA', description: 'Codeudor no califica para el crédito' },
      { name: 'FALLA_SEGURO_REQUERIDO', description: 'Seguro requerido no disponible' },
      { name: 'FALLA_CAPACITACION_FINANCIERA_REQUERIDA', description: 'Capacitación financiera requerida no completada' },
      { name: 'FALLA_REPORTE_UIAF_REQUERIDO', description: 'Reporte UIAF requerido no presentado' },
      { name: 'FALLA_PERIODO_RESTRICCION_ACTIVO', description: 'Período de restricción activo' },
      { name: 'FALLA_REQUIERE_APROBACION_MANUAL', description: 'Requiere aprobación manual del comité' },
      { name: 'FALLA_EVALUACION_CONJUNTA_FALLIDA', description: 'Evaluación conjunta con codeudor fallida' },
      { name: 'FALLA_DESCUENTO_NOMINA_NO_AUTORIZADO', description: 'Descuento por nómina no autorizado' },
      { name: 'FALLA_DESCUENTO_MESADA_EXCESIVO', description: 'Descuento por mesada excesivo' },
      { name: 'FALLA_TRAMITE_EXPRESS_NO_DISPONIBLE', description: 'Trámite express no disponible' },
      { name: 'FALLA_TASA_PREFERENCIAL_NO_APLICA', description: 'Tasa preferencial no aplica' },
      { name: 'FALLA_APROBACION_AUTOMATICA_FALLIDA', description: 'Aprobación automática fallida' },
      { name: 'FALLA_BENEFICIO_PREFERENCIAL_NO_APLICA', description: 'Beneficio preferencial no aplica' },
      { name: 'FALLA_DESCUENTO_TASA_NO_APLICA', description: 'Descuento de tasa no aplica' },
    ];

    for (const failureData of systemFailures) {
      const existingFailure = await this.failureRepository.findOne({ where: { name: failureData.name } });
      if (!existingFailure) {
        const failure = this.failureRepository.create(failureData);
        await this.failureRepository.save(failure);
        console.log(`✅ Failure creado: ${failureData.name}`);
      } else {
        console.log(`⚠️  Failure ya existe: ${failureData.name}`);
      }
    }

    console.log('✅ Failures del sistema experto poblados exitosamente');
  }

  async createFactsFailuresRelations(): Promise<void> {
    console.log('🔄 Creando relaciones facts-failures...');

    // Obtener todos los facts y failures
    const facts = await this.factRepository.find();
    const failures = await this.failureRepository.find();

    // Crear mapa para búsqueda rápida
    const factMap = new Map(facts.map(f => [f.code, f]));
    const failureMap = new Map(failures.map(f => [f.name, f]));

    // Definir relaciones basadas en las reglas del documento
    const relations = [
      // RELACIONES DE ADMISIBILIDAD GENERAL (R001-R005)
      { factCode: 'FACT_EDAD_MENOR_18', failureName: 'FALLA_EDAD_FUERA_RANGO' },
      { factCode: 'FACT_EDAD_MAYOR_75', failureName: 'FALLA_EDAD_FUERA_RANGO' },
      { factCode: 'FACT_INGRESOS_INSUFICIENTES', failureName: 'FALLA_INGRESOS_INSUFICIENTES' },
      { factCode: 'FACT_SCORE_INSUFICIENTE', failureName: 'FALLA_SCORE_INSUFICIENTE' },
      { factCode: 'FACT_ENDEUDAMIENTO_EXCESIVO', failureName: 'FALLA_ENDEUDAMIENTO_EXCESIVO' },
      { factCode: 'FACT_MORA_RECIENTE_SIGNIFICATIVA', failureName: 'FALLA_MORA_RECIENTE_SIGNIFICATIVA' },

      // RELACIONES DE CLASIFICACIÓN DE RIESGO (R010-R012)
      { factCode: 'FACT_SCORE_700_PLUS', failureName: 'FALLA_NO_CUMPLE_RIESGO_BAJO' },
      { factCode: 'FACT_MORA_MAX_30_DIAS', failureName: 'FALLA_NO_CUMPLE_RIESGO_BAJO' },
      { factCode: 'FACT_SCORE_500_699', failureName: 'FALLA_NO_CUMPLE_RIESGO_MEDIO' },
      { factCode: 'FACT_MORA_MAX_60_DIAS', failureName: 'FALLA_NO_CUMPLE_RIESGO_MEDIO' },
      { factCode: 'FACT_SCORE_300_499', failureName: 'FALLA_NO_CUMPLE_RIESGO_ALTO' },
      { factCode: 'FACT_MORA_31_90_DIAS', failureName: 'FALLA_NO_CUMPLE_RIESGO_ALTO' },

      // RELACIONES DE RECOMENDACIÓN DE PRODUCTOS - BAJO RIESGO (R020-R023)
      { factCode: 'FACT_PERFIL_RIESGO_BAJO', failureName: 'FALLA_NO_APLICA_CREDITO_HIPOTECARIO' },
      { factCode: 'FACT_FINALIDAD_VIVIENDA', failureName: 'FALLA_NO_APLICA_CREDITO_HIPOTECARIO' },
      { factCode: 'FACT_INGRESOS_MIN_4_SMMLV', failureName: 'FALLA_NO_APLICA_CREDITO_HIPOTECARIO' },
      { factCode: 'FACT_CUOTA_MAX_30_INGRESOS', failureName: 'FALLA_NO_APLICA_CREDITO_HIPOTECARIO' },
      { factCode: 'FACT_PERFIL_RIESGO_BAJO', failureName: 'FALLA_NO_APLICA_CREDITO_VEHICULO' },
      { factCode: 'FACT_FINALIDAD_VEHICULO', failureName: 'FALLA_NO_APLICA_CREDITO_VEHICULO' },
      { factCode: 'FACT_INGRESOS_MIN_3_SMMLV', failureName: 'FALLA_NO_APLICA_CREDITO_VEHICULO' },
      { factCode: 'FACT_CUOTA_MAX_40_INGRESOS', failureName: 'FALLA_NO_APLICA_CREDITO_VEHICULO' },
      { factCode: 'FACT_PERFIL_RIESGO_BAJO', failureName: 'FALLA_NO_APLICA_CREDITO_LIBRE_INVERSION' },
      { factCode: 'FACT_INGRESOS_MIN_3_SMMLV', failureName: 'FALLA_NO_APLICA_CREDITO_LIBRE_INVERSION' },
      { factCode: 'FACT_ANTIGUEDAD_LABORAL_12_MESES', failureName: 'FALLA_NO_APLICA_CREDITO_LIBRE_INVERSION' },
      { factCode: 'FACT_PERFIL_RIESGO_BAJO', failureName: 'FALLA_NO_APLICA_TARJETA_CREDITO' },
      { factCode: 'FACT_INGRESOS_MIN_2_SMMLV', failureName: 'FALLA_NO_APLICA_TARJETA_CREDITO' },

      // RELACIONES DE RECOMENDACIÓN DE PRODUCTOS - MEDIO RIESGO (R030-R032)
      { factCode: 'FACT_PERFIL_RIESGO_MEDIO', failureName: 'FALLA_NO_APLICA_CREDITO_VEHICULO_CONDICIONADO' },
      { factCode: 'FACT_FINALIDAD_VEHICULO', failureName: 'FALLA_NO_APLICA_CREDITO_VEHICULO_CONDICIONADO' },
      { factCode: 'FACT_INGRESOS_MIN_4_SMMLV', failureName: 'FALLA_NO_APLICA_CREDITO_VEHICULO_CONDICIONADO' },
      { factCode: 'FACT_PORCENTAJE_INICIAL_30', failureName: 'FALLA_NO_APLICA_CREDITO_VEHICULO_CONDICIONADO' },
      { factCode: 'FACT_PERFIL_RIESGO_MEDIO', failureName: 'FALLA_NO_APLICA_CREDITO_CON_CODEUDOR' },
      { factCode: 'FACT_INGRESOS_MIN_2_SMMLV', failureName: 'FALLA_NO_APLICA_CREDITO_CON_CODEUDOR' },
      { factCode: 'FACT_CODEUDOR_DISPONIBLE', failureName: 'FALLA_NO_APLICA_CREDITO_CON_CODEUDOR' },
      { factCode: 'FACT_INGRESOS_CODEUDOR_2_SMMLV', failureName: 'FALLA_NO_APLICA_CREDITO_CON_CODEUDOR' },
      { factCode: 'FACT_PERFIL_RIESGO_MEDIO', failureName: 'FALLA_NO_APLICA_MICROCREDITO' },
      { factCode: 'FACT_INGRESOS_MIN_1_SMMLV', failureName: 'FALLA_NO_APLICA_MICROCREDITO' },
      { factCode: 'FACT_ACTIVIDAD_MICROEMPRESARIAL', failureName: 'FALLA_NO_APLICA_MICROCREDITO' },

      // RELACIONES DE VALIDACIÓN NORMATIVA (R040-R042)
      { factCode: 'FACT_ACTIVIDAD_ALTO_RIESGO_SARLAFT', failureName: 'FALLA_ACTIVIDAD_ALTO_RIESGO_SARLAFT' },
      { factCode: 'FACT_PERSONA_PEP', failureName: 'FALLA_PERSONA_PEP_SIN_APROBACION' },
      { factCode: 'FACT_MULTIPLES_CONSULTAS', failureName: 'FALLA_MULTIPLES_CONSULTAS' },

      // RELACIONES DE CONDICIONES ESPECIALES (R050-R052)
      { factCode: 'FACT_ANTIGUEDAD_CLIENTE_24_MESES', failureName: 'FALLA_NO_APLICA_CLIENTE_PREFERENCIAL' },
      { factCode: 'FACT_CUMPLIMIENTO_HISTORICO_95', failureName: 'FALLA_NO_APLICA_CLIENTE_PREFERENCIAL' },
      { factCode: 'FACT_EMPLEADO_EMPRESA_CONVENIO', failureName: 'FALLA_NO_APLICA_CREDITO_NOMINA' },
      { factCode: 'FACT_DESCUENTO_NOMINA_AUTORIZADO', failureName: 'FALLA_NO_APLICA_CREDITO_NOMINA' },
      { factCode: 'FACT_TIPO_VINCULACION_PENSIONADO', failureName: 'FALLA_NO_APLICA_CREDITO_PENSIONADOS' },
      { factCode: 'FACT_MESADA_PENSION_2_SMMLV', failureName: 'FALLA_NO_APLICA_CREDITO_PENSIONADOS' },
      { factCode: 'FACT_PENSION_LEGAL', failureName: 'FALLA_NO_APLICA_CREDITO_PENSIONADOS' },

      // RELACIONES ADICIONALES PARA CASOS ESPECIALES
      { factCode: 'FACT_SCORE_300_499', failureName: 'FALLA_CASO_ZONA_GRIS' },
      { factCode: 'FACT_DOCUMENTACION_COMPLETA', failureName: 'FALLA_INFORMACION_INCONSISTENTE' },
      { factCode: 'FACT_DOCUMENTACION_COMPLETA', failureName: 'FALLA_DOCUMENTACION_INCOMPLETA' },
      { factCode: 'FACT_VERIFICACION_EXTERNA_OK', failureName: 'FALLA_VERIFICACION_EXTERNA_FALLIDA' },
      { factCode: 'FACT_CUMPLIMIENTO_NORMATIVO', failureName: 'FALLA_CUMPLIMIENTO_NORMATIVO' },
      { factCode: 'FACT_INGRESOS_MIN_1_SMMLV', failureName: 'FALLA_CAPACIDAD_PAGO_INSUFICIENTE' },
      { factCode: 'FACT_ESTABILIDAD_LABORAL', failureName: 'FALLA_ESTABILIDAD_LABORAL_INSUFICIENTE' },
      { factCode: 'FACT_SCORE_MIN_300', failureName: 'FALLA_HISTORIAL_CREDITICIO_DEFICIENTE' },
      { factCode: 'FACT_COMPORTAMIENTO_PAGO_EXCELENTE', failureName: 'FALLA_COMPORTAMIENTO_PAGO_DEFICIENTE' },
      { factCode: 'FACT_ZONA_BAJO_RIESGO', failureName: 'FALLA_CONCENTRACION_RIESGO' },
      { factCode: 'FACT_SIN_REFINANCIACIONES', failureName: 'FALLA_REFINANCIACIONES_EXCESIVAS' },
      { factCode: 'FACT_ZONA_BAJO_RIESGO', failureName: 'FALLA_ZONA_ALTO_RIESGO' },
      { factCode: 'FACT_ACTIVIDAD_BAJO_RIESGO_SARLAFT', failureName: 'FALLA_ACTIVIDAD_ECONOMICA_RIESGOSA' },
      { factCode: 'FACT_CONSULTAS_RECIENTES_MINIMAS', failureName: 'FALLA_CONSULTAS_EXCESIVAS' },
      { factCode: 'FACT_SIN_MORA_ULTIMOS_12_MESES', failureName: 'FALLA_MORA_HISTORICA_SIGNIFICATIVA' },
      { factCode: 'FACT_ENDEUDAMIENTO_MAX_50', failureName: 'FALLA_OBLIGACIONES_VIGENTES_EXCESIVAS' },
      { factCode: 'FACT_PATRIMONIO_LIQUIDO', failureName: 'FALLA_PATRIMONIO_INSUFICIENTE' },
      { factCode: 'FACT_AHORROS_ULTIMOS_6_MESES', failureName: 'FALLA_AHORROS_INSUFICIENTES' },
      { factCode: 'FACT_INGRESOS_ADICIONALES', failureName: 'FALLA_INGRESOS_ADICIONALES_INSUFICIENTES' },
    ];

    let relationsCreated = 0;
    for (const relation of relations) {
      const fact = factMap.get(relation.factCode);
      const failure = failureMap.get(relation.failureName);

      if (fact && failure) {
        const existingRelation = await this.factsFailureRepository.findOne({
          where: { fact_id: fact.id, failure_id: failure.id }
        });

        if (!existingRelation) {
          const factsFailure = this.factsFailureRepository.create({
            fact_id: fact.id,
            failure_id: failure.id
          });
          await this.factsFailureRepository.save(factsFailure);
          relationsCreated++;
          console.log(`✅ Relación creada: ${relation.factCode} -> ${relation.failureName}`);
        } else {
          console.log(`⚠️  Relación ya existe: ${relation.factCode} -> ${relation.failureName}`);
        }
      } else {
        console.log(`❌ No se encontró fact o failure: ${relation.factCode} -> ${relation.failureName}`);
      }
    }

    console.log(`✅ Relaciones facts-failures creadas exitosamente: ${relationsCreated} nuevas relaciones`);
  }

  async setupSystemExpertData(): Promise<{ message: string; stats: any }> {
    try {
      console.log('🚀 Iniciando configuración del sistema experto...');

      await this.populateSystemFacts();
      await this.populateSystemFailures();
      await this.createFactsFailuresRelations();

      // Obtener estadísticas finales
      const factsCount = await this.factRepository.count();
      const failuresCount = await this.failureRepository.count();
      const relationsCount = await this.factsFailureRepository.count();

      const stats = {
        facts: factsCount,
        failures: failuresCount,
        relations: relationsCount
      };

      console.log('🎉 ¡Configuración del sistema experto completada exitosamente!');
      console.log(`📊 Estadísticas finales:`, stats);

      return {
        message: 'Sistema experto configurado exitosamente',
        stats
      };

    } catch (error) {
      console.error('❌ Error en la configuración del sistema experto:', error);
      throw error;
    }
  }
}
