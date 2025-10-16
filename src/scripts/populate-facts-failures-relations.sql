-- Script para crear las relaciones facts-failures del sistema experto
-- Basado en las reglas R001-R052 del documento sistema.txt

-- Limpiar relaciones existentes (opcional - comentar si no se desea)
-- DELETE FROM sys.facts_failures;

-- RELACIONES DE ADMISIBILIDAD GENERAL (R001-R005)
-- R001 - Verificación de Edad
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_EDAD_MENOR_18' AND fail.name = 'FALLA_EDAD_FUERA_RANGO';

INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_EDAD_MAYOR_75' AND fail.name = 'FALLA_EDAD_FUERA_RANGO';

-- R002 - Verificación de Ingresos Mínimos
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_INGRESOS_INSUFICIENTES' AND fail.name = 'FALLA_INGRESOS_INSUFICIENTES';

-- R003 - Verificación de Score Crediticio
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_SCORE_INSUFICIENTE' AND fail.name = 'FALLA_SCORE_INSUFICIENTE';

-- R004 - Verificación de Nivel de Endeudamiento
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_ENDEUDAMIENTO_EXCESIVO' AND fail.name = 'FALLA_ENDEUDAMIENTO_EXCESIVO';

-- R005 - Verificación de Mora Reciente
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_MORA_RECIENTE_SIGNIFICATIVA' AND fail.name = 'FALLA_MORA_RECIENTE_SIGNIFICATIVA';

-- RELACIONES DE CLASIFICACIÓN DE RIESGO (R010-R012)
-- R010 - Clasificación Riesgo Bajo
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_SCORE_700_PLUS' AND fail.name = 'FALLA_NO_CUMPLE_RIESGO_BAJO';

INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_MORA_MAX_30_DIAS' AND fail.name = 'FALLA_NO_CUMPLE_RIESGO_BAJO';

-- R011 - Clasificación Riesgo Medio
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_SCORE_500_699' AND fail.name = 'FALLA_NO_CUMPLE_RIESGO_MEDIO';

INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_MORA_MAX_60_DIAS' AND fail.name = 'FALLA_NO_CUMPLE_RIESGO_MEDIO';

-- R012 - Clasificación Riesgo Alto
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_SCORE_300_499' AND fail.name = 'FALLA_NO_CUMPLE_RIESGO_ALTO';

INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_MORA_31_90_DIAS' AND fail.name = 'FALLA_NO_CUMPLE_RIESGO_ALTO';

-- RELACIONES DE RECOMENDACIÓN DE PRODUCTOS - BAJO RIESGO (R020-R023)
-- R020 - Crédito Hipotecario
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_PERFIL_RIESGO_BAJO' AND fail.name = 'FALLA_NO_APLICA_CREDITO_HIPOTECARIO';

INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_FINALIDAD_VIVIENDA' AND fail.name = 'FALLA_NO_APLICA_CREDITO_HIPOTECARIO';

INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_INGRESOS_MIN_4_SMMLV' AND fail.name = 'FALLA_NO_APLICA_CREDITO_HIPOTECARIO';

INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_CUOTA_MAX_30_INGRESOS' AND fail.name = 'FALLA_NO_APLICA_CREDITO_HIPOTECARIO';

-- R021 - Crédito Vehículo
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_PERFIL_RIESGO_BAJO' AND fail.name = 'FALLA_NO_APLICA_CREDITO_VEHICULO';

INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_FINALIDAD_VEHICULO' AND fail.name = 'FALLA_NO_APLICA_CREDITO_VEHICULO';

INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_INGRESOS_MIN_3_SMMLV' AND fail.name = 'FALLA_NO_APLICA_CREDITO_VEHICULO';

INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_CUOTA_MAX_40_INGRESOS' AND fail.name = 'FALLA_NO_APLICA_CREDITO_VEHICULO';

-- R022 - Crédito Libre Inversión
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_PERFIL_RIESGO_BAJO' AND fail.name = 'FALLA_NO_APLICA_CREDITO_LIBRE_INVERSION';

INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_INGRESOS_MIN_3_SMMLV' AND fail.name = 'FALLA_NO_APLICA_CREDITO_LIBRE_INVERSION';

INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_ANTIGUEDAD_LABORAL_12_MESES' AND fail.name = 'FALLA_NO_APLICA_CREDITO_LIBRE_INVERSION';

-- R023 - Tarjeta de Crédito
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_PERFIL_RIESGO_BAJO' AND fail.name = 'FALLA_NO_APLICA_TARJETA_CREDITO';

INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_INGRESOS_MIN_2_SMMLV' AND fail.name = 'FALLA_NO_APLICA_TARJETA_CREDITO';

-- RELACIONES DE RECOMENDACIÓN DE PRODUCTOS - MEDIO RIESGO (R030-R032)
-- R030 - Crédito Vehículo Condicionado
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_PERFIL_RIESGO_MEDIO' AND fail.name = 'FALLA_NO_APLICA_CREDITO_VEHICULO_CONDICIONADO';

INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_FINALIDAD_VEHICULO' AND fail.name = 'FALLA_NO_APLICA_CREDITO_VEHICULO_CONDICIONADO';

INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_INGRESOS_MIN_4_SMMLV' AND fail.name = 'FALLA_NO_APLICA_CREDITO_VEHICULO_CONDICIONADO';

INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_PORCENTAJE_INICIAL_30' AND fail.name = 'FALLA_NO_APLICA_CREDITO_VEHICULO_CONDICIONADO';

-- R031 - Crédito con Codeudor
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_PERFIL_RIESGO_MEDIO' AND fail.name = 'FALLA_NO_APLICA_CREDITO_CON_CODEUDOR';

INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_INGRESOS_MIN_2_SMMLV' AND fail.name = 'FALLA_NO_APLICA_CREDITO_CON_CODEUDOR';

INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_CODEUDOR_DISPONIBLE' AND fail.name = 'FALLA_NO_APLICA_CREDITO_CON_CODEUDOR';

INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_INGRESOS_CODEUDOR_2_SMMLV' AND fail.name = 'FALLA_NO_APLICA_CREDITO_CON_CODEUDOR';

-- R032 - Microcrédito
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_PERFIL_RIESGO_MEDIO' AND fail.name = 'FALLA_NO_APLICA_MICROCREDITO';

INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_INGRESOS_MIN_1_SMMLV' AND fail.name = 'FALLA_NO_APLICA_MICROCREDITO';

INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_ACTIVIDAD_MICROEMPRESARIAL' AND fail.name = 'FALLA_NO_APLICA_MICROCREDITO';

-- RELACIONES DE VALIDACIÓN NORMATIVA (R040-R042)
-- R040 - Validación SARLAFT
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_ACTIVIDAD_ALTO_RIESGO_SARLAFT' AND fail.name = 'FALLA_ACTIVIDAD_ALTO_RIESGO_SARLAFT';

-- R041 - Validación PEP
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_PERSONA_PEP' AND fail.name = 'FALLA_PERSONA_PEP_SIN_APROBACION';

-- R042 - Múltiples Consultas
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_MULTIPLES_CONSULTAS' AND fail.name = 'FALLA_MULTIPLES_CONSULTAS';

-- RELACIONES DE CONDICIONES ESPECIALES (R050-R052)
-- R050 - Cliente Preferencial
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_ANTIGUEDAD_CLIENTE_24_MESES' AND fail.name = 'FALLA_NO_APLICA_CLIENTE_PREFERENCIAL';

INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_CUMPLIMIENTO_HISTORICO_95' AND fail.name = 'FALLA_NO_APLICA_CLIENTE_PREFERENCIAL';

-- R051 - Empleado Empresa Convenio
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_EMPLEADO_EMPRESA_CONVENIO' AND fail.name = 'FALLA_NO_APLICA_CREDITO_NOMINA';

INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_DESCUENTO_NOMINA_AUTORIZADO' AND fail.name = 'FALLA_NO_APLICA_CREDITO_NOMINA';

-- R052 - Pensionado
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_TIPO_VINCULACION_PENSIONADO' AND fail.name = 'FALLA_NO_APLICA_CREDITO_PENSIONADOS';

INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_MESADA_PENSION_2_SMMLV' AND fail.name = 'FALLA_NO_APLICA_CREDITO_PENSIONADOS';

INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_PENSION_LEGAL' AND fail.name = 'FALLA_NO_APLICA_CREDITO_PENSIONADOS';

-- RELACIONES ADICIONALES PARA CASOS ESPECIALES
-- Relaciones para casos de zona gris
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_SCORE_300_499' AND fail.name = 'FALLA_CASO_ZONA_GRIS';

-- Relaciones para inconsistencias
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_DOCUMENTACION_COMPLETA' AND fail.name = 'FALLA_INFORMACION_INCONSISTENTE';

-- Relaciones para documentación
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_DOCUMENTACION_COMPLETA' AND fail.name = 'FALLA_DOCUMENTACION_INCOMPLETA';

-- Relaciones para verificación externa
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_VERIFICACION_EXTERNA_OK' AND fail.name = 'FALLA_VERIFICACION_EXTERNA_FALLIDA';

-- Relaciones para cumplimiento normativo
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_CUMPLIMIENTO_NORMATIVO' AND fail.name = 'FALLA_CUMPLIMIENTO_NORMATIVO';

-- Relaciones para capacidad de pago
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_INGRESOS_MIN_1_SMMLV' AND fail.name = 'FALLA_CAPACIDAD_PAGO_INSUFICIENTE';

-- Relaciones para estabilidad laboral
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_ESTABILIDAD_LABORAL' AND fail.name = 'FALLA_ESTABILIDAD_LABORAL_INSUFICIENTE';

-- Relaciones para historial crediticio
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_SCORE_MIN_300' AND fail.name = 'FALLA_HISTORIAL_CREDITICIO_DEFICIENTE';

-- Relaciones para comportamiento de pago
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_COMPORTAMIENTO_PAGO_EXCELENTE' AND fail.name = 'FALLA_COMPORTAMIENTO_PAGO_DEFICIENTE';

-- Relaciones para concentración de riesgo
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_ZONA_BAJO_RIESGO' AND fail.name = 'FALLA_CONCENTRACION_RIESGO';

-- Relaciones para refinanciaciones
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_SIN_REFINANCIACIONES' AND fail.name = 'FALLA_REFINANCIACIONES_EXCESIVAS';

-- Relaciones para zona geográfica
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_ZONA_BAJO_RIESGO' AND fail.name = 'FALLA_ZONA_ALTO_RIESGO';

-- Relaciones para actividad económica
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_ACTIVIDAD_BAJO_RIESGO_SARLAFT' AND fail.name = 'FALLA_ACTIVIDAD_ECONOMICA_RIESGOSA';

-- Relaciones para consultas excesivas
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_CONSULTAS_RECIENTES_MINIMAS' AND fail.name = 'FALLA_CONSULTAS_EXCESIVAS';

-- Relaciones para mora histórica
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_SIN_MORA_ULTIMOS_12_MESES' AND fail.name = 'FALLA_MORA_HISTORICA_SIGNIFICATIVA';

-- Relaciones para obligaciones vigentes
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_ENDEUDAMIENTO_MAX_50' AND fail.name = 'FALLA_OBLIGACIONES_VIGENTES_EXCESIVAS';

-- Relaciones para patrimonio
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_PATRIMONIO_LIQUIDO' AND fail.name = 'FALLA_PATRIMONIO_INSUFICIENTE';

-- Relaciones para ahorros
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_AHORROS_ULTIMOS_6_MESES' AND fail.name = 'FALLA_AHORROS_INSUFICIENTES';

-- Relaciones para ingresos adicionales
INSERT INTO sys.facts_failures (fact_id, failure_id) 
SELECT f.id, fail.id 
FROM sys.facts f, sys.failures fail 
WHERE f.code = 'FACT_INGRESOS_ADICIONALES' AND fail.name = 'FALLA_INGRESOS_ADICIONALES_INSUFICIENTES';
