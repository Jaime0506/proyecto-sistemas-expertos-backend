-- Script para poblar la base de datos con todos los facts del sistema experto
-- Basado en las reglas R001-R052 del documento sistema.txt

-- Limpiar facts existentes (opcional - comentar si no se desea)
-- DELETE FROM sys.facts;

-- FACTS DE ADMISIBILIDAD GENERAL (R001-R005)
INSERT INTO sys.facts (code, description) VALUES
-- R001 - Verificación de Edad
('FACT_EDAD_18_75', 'Edad del solicitante entre 18 y 75 años'),
('FACT_EDAD_MENOR_18', 'Edad del solicitante menor a 18 años'),
('FACT_EDAD_MAYOR_75', 'Edad del solicitante mayor a 75 años'),

-- R002 - Verificación de Ingresos Mínimos
('FACT_INGRESOS_MIN_1_SMMLV', 'Ingresos mensuales netos igual o superior a 1 SMMLV'),
('FACT_INGRESOS_INSUFICIENTES', 'Ingresos mensuales netos inferiores a 1 SMMLV'),

-- R003 - Verificación de Score Crediticio
('FACT_SCORE_MIN_300', 'Score en centrales de riesgo igual o superior a 300 puntos'),
('FACT_SCORE_INSUFICIENTE', 'Score en centrales de riesgo inferior a 300 puntos'),

-- R004 - Verificación de Nivel de Endeudamiento
('FACT_ENDEUDAMIENTO_MAX_50', 'Nivel de endeudamiento igual o inferior al 50% de ingresos'),
('FACT_ENDEUDAMIENTO_EXCESIVO', 'Nivel de endeudamiento superior al 50% de ingresos'),

-- R005 - Verificación de Mora Reciente
('FACT_MORA_MAX_90_DIAS', 'Mora máxima en últimos 12 meses igual o inferior a 90 días'),
('FACT_MORA_RECIENTE_SIGNIFICATIVA', 'Mora máxima en últimos 12 meses superior a 90 días');

-- FACTS DE CLASIFICACIÓN DE RIESGO (R010-R012)
INSERT INTO sys.facts (code, description) VALUES
-- R010 - Clasificación Riesgo Bajo
('FACT_SCORE_700_PLUS', 'Score en centrales de riesgo igual o superior a 700 puntos'),
('FACT_MORA_MAX_30_DIAS', 'Mora máxima en últimos 12 meses igual o inferior a 30 días'),

-- R011 - Clasificación Riesgo Medio
('FACT_SCORE_500_699', 'Score en centrales de riesgo entre 500 y 699 puntos'),
('FACT_MORA_MAX_60_DIAS', 'Mora máxima en últimos 12 meses igual o inferior a 60 días'),

-- R012 - Clasificación Riesgo Alto
('FACT_SCORE_300_499', 'Score en centrales de riesgo entre 300 y 499 puntos'),
('FACT_MORA_31_90_DIAS', 'Mora máxima en últimos 12 meses entre 31 y 90 días');

-- FACTS DE RECOMENDACIÓN DE PRODUCTOS - BAJO RIESGO (R020-R023)
INSERT INTO sys.facts (code, description) VALUES
-- R020 - Crédito Hipotecario
('FACT_PERFIL_RIESGO_BAJO', 'Clasificación de perfil de riesgo bajo'),
('FACT_FINALIDAD_VIVIENDA', 'Finalidad del crédito es para vivienda'),
('FACT_INGRESOS_MIN_4_SMMLV', 'Ingresos mensuales netos igual o superior a 4 SMMLV'),
('FACT_CUOTA_MAX_30_INGRESOS', 'Cuota proyectada igual o inferior al 30% de ingresos'),

-- R021 - Crédito Vehículo
('FACT_FINALIDAD_VEHICULO', 'Finalidad del crédito es para vehículo'),
('FACT_INGRESOS_MIN_3_SMMLV', 'Ingresos mensuales netos igual o superior a 3 SMMLV'),
('FACT_CUOTA_MAX_40_INGRESOS', 'Cuota proyectada igual o inferior al 40% de ingresos'),

-- R022 - Crédito Libre Inversión
('FACT_ANTIGUEDAD_LABORAL_12_MESES', 'Antigüedad laboral igual o superior a 12 meses'),

-- R023 - Tarjeta de Crédito
('FACT_INGRESOS_MIN_2_SMMLV', 'Ingresos mensuales netos igual o superior a 2 SMMLV');

-- FACTS DE RECOMENDACIÓN DE PRODUCTOS - MEDIO RIESGO (R030-R032)
INSERT INTO sys.facts (code, description) VALUES
-- R030 - Crédito Vehículo Condicionado
('FACT_PERFIL_RIESGO_MEDIO', 'Clasificación de perfil de riesgo medio'),
('FACT_PORCENTAJE_INICIAL_30', 'Porcentaje de inicial igual o superior al 30%'),

-- R031 - Crédito con Codeudor
('FACT_CODEUDOR_DISPONIBLE', 'Codeudor disponible para el crédito'),
('FACT_INGRESOS_CODEUDOR_2_SMMLV', 'Ingresos del codeudor igual o superior a 2 SMMLV'),

-- R032 - Microcrédito
('FACT_ACTIVIDAD_MICROEMPRESARIAL', 'Actividad microempresarial comprobada');

-- FACTS DE VALIDACIÓN NORMATIVA (R040-R042)
INSERT INTO sys.facts (code, description) VALUES
-- R040 - Validación SARLAFT
('FACT_ACTIVIDAD_ALTO_RIESGO_SARLAFT', 'Actividad económica en lista de alto riesgo SARLAFT'),
('FACT_ACTIVIDAD_BAJO_RIESGO_SARLAFT', 'Actividad económica no está en lista de alto riesgo SARLAFT'),

-- R041 - Validación PEP
('FACT_PERSONA_PEP', 'Persona políticamente expuesta'),
('FACT_APROBACION_COMITE_PEP', 'Aprobación de comité especial para PEP'),

-- R042 - Múltiples Consultas
('FACT_CONSULTAS_ULTIMOS_30_DIAS_3', 'Número de consultas en últimos 30 días igual o inferior a 3'),
('FACT_MULTIPLES_CONSULTAS', 'Múltiples consultas simultáneas detectadas');

-- FACTS DE CONDICIONES ESPECIALES (R050-R052)
INSERT INTO sys.facts (code, description) VALUES
-- R050 - Cliente Preferencial
('FACT_ANTIGUEDAD_CLIENTE_24_MESES', 'Antigüedad como cliente igual o superior a 24 meses'),
('FACT_CUMPLIMIENTO_HISTORICO_95', 'Cumplimiento histórico igual o superior al 95%'),

-- R051 - Empleado Empresa Convenio
('FACT_EMPLEADO_EMPRESA_CONVENIO', 'Empleado de empresa con convenio'),
('FACT_DESCUENTO_NOMINA_AUTORIZADO', 'Descuento por nómina autorizado'),

-- R052 - Pensionado
('FACT_TIPO_VINCULACION_PENSIONADO', 'Tipo de vinculación es pensionado'),
('FACT_MESADA_PENSION_2_SMMLV', 'Mesada de pensión igual o superior a 2 SMMLV'),
('FACT_PENSION_LEGAL', 'Pensión legal comprobada');

-- FACTS ADICIONALES PARA PRODUCTOS ESPECÍFICOS
INSERT INTO sys.facts (code, description) VALUES
-- Fact para valor de vivienda
('FACT_VALOR_VIVIENDA_DISPONIBLE', 'Valor de vivienda disponible para crédito hipotecario'),

-- Fact para valor de vehículo
('FACT_VALOR_VEHICULO_DISPONIBLE', 'Valor de vehículo disponible para crédito vehicular'),

-- Fact para ingresos adicionales
('FACT_INGRESOS_ADICIONALES', 'Ingresos adicionales comprobables'),

-- Fact para patrimonio
('FACT_PATRIMONIO_LIQUIDO', 'Patrimonio líquido disponible'),

-- Fact para ahorros
('FACT_AHORROS_ULTIMOS_6_MESES', 'Ahorros en últimos 6 meses'),

-- Fact para estabilidad laboral
('FACT_ESTABILIDAD_LABORAL', 'Estabilidad laboral comprobada'),

-- Fact para sector económico
('FACT_SECTOR_ECONOMICO_ESTABLE', 'Sector económico estable'),

-- Fact para tamaño empresa
('FACT_EMPRESA_GRANDE', 'Empresa de gran tamaño'),

-- Fact para tipo de vinculación
('FACT_VINCULACION_INDEFINIDA', 'Vinculación laboral indefinida'),

-- Fact para comportamiento de pago
('FACT_COMPORTAMIENTO_PAGO_EXCELENTE', 'Comportamiento de pago excelente en últimos 12 meses'),

-- Fact para días de mora
('FACT_SIN_MORA_ULTIMOS_12_MESES', 'Sin mora en últimos 12 meses'),

-- Fact para consultas recientes
('FACT_CONSULTAS_RECIENTES_MINIMAS', 'Consultas recientes mínimas en centrales de riesgo'),

-- Fact para refinanciaciones
('FACT_SIN_REFINANCIACIONES', 'Sin refinanciaciones recientes'),

-- Fact para concentración geográfica
('FACT_ZONA_BAJO_RIESGO', 'Zona geográfica de bajo riesgo'),

-- Fact para documentación
('FACT_DOCUMENTACION_COMPLETA', 'Documentación completa y verificada'),

-- Fact para verificación externa
('FACT_VERIFICACION_EXTERNA_OK', 'Verificación externa exitosa'),

-- Fact para cumplimiento normativo
('FACT_CUMPLIMIENTO_NORMATIVO', 'Cumplimiento normativo verificado');
