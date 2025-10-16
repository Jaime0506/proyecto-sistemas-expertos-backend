-- Script para poblar la base de datos con todos los failures del sistema experto
-- Basado en las reglas R001-R052 del documento sistema.txt

-- Limpiar failures existentes (opcional - comentar si no se desea)
-- DELETE FROM sys.failures;

-- FAILURES DE ADMISIBILIDAD GENERAL (R001-R005)
INSERT INTO sys.failures (name, description) VALUES
-- R001 - Verificación de Edad
('FALLA_EDAD_FUERA_RANGO', 'Edad fuera del rango permitido (18-75 años) - Código: ADM001'),

-- R002 - Verificación de Ingresos Mínimos
('FALLA_INGRESOS_INSUFICIENTES', 'Ingresos insuficientes, mínimo requerido 1 SMMLV - Código: ADM002'),

-- R003 - Verificación de Score Crediticio
('FALLA_SCORE_INSUFICIENTE', 'Score crediticio insuficiente, mínimo requerido 300 puntos - Código: ADM003'),

-- R004 - Verificación de Nivel de Endeudamiento
('FALLA_ENDEUDAMIENTO_EXCESIVO', 'Nivel de endeudamiento excesivo, máximo permitido 50% - Código: ADM004'),

-- R005 - Verificación de Mora Reciente
('FALLA_MORA_RECIENTE_SIGNIFICATIVA', 'Mora reciente significativa superior a 90 días - Código: ADM005');

-- FAILURES DE CLASIFICACIÓN DE RIESGO (R010-R012)
INSERT INTO sys.failures (name, description) VALUES
-- R010 - Clasificación Riesgo Bajo
('FALLA_NO_CUMPLE_RIESGO_BAJO', 'No cumple criterios para clasificación de riesgo bajo'),

-- R011 - Clasificación Riesgo Medio
('FALLA_NO_CUMPLE_RIESGO_MEDIO', 'No cumple criterios para clasificación de riesgo medio'),

-- R012 - Clasificación Riesgo Alto
('FALLA_NO_CUMPLE_RIESGO_ALTO', 'No cumple criterios para clasificación de riesgo alto');

-- FAILURES DE RECOMENDACIÓN DE PRODUCTOS - BAJO RIESGO (R020-R023)
INSERT INTO sys.failures (name, description) VALUES
-- R020 - Crédito Hipotecario
('FALLA_NO_APLICA_CREDITO_HIPOTECARIO', 'No aplica para crédito hipotecario - criterios no cumplidos'),

-- R021 - Crédito Vehículo
('FALLA_NO_APLICA_CREDITO_VEHICULO', 'No aplica para crédito vehicular - criterios no cumplidos'),

-- R022 - Crédito Libre Inversión
('FALLA_NO_APLICA_CREDITO_LIBRE_INVERSION', 'No aplica para crédito de libre inversión - criterios no cumplidos'),

-- R023 - Tarjeta de Crédito
('FALLA_NO_APLICA_TARJETA_CREDITO', 'No aplica para tarjeta de crédito - criterios no cumplidos');

-- FAILURES DE RECOMENDACIÓN DE PRODUCTOS - MEDIO RIESGO (R030-R032)
INSERT INTO sys.failures (name, description) VALUES
-- R030 - Crédito Vehículo Condicionado
('FALLA_NO_APLICA_CREDITO_VEHICULO_CONDICIONADO', 'No aplica para crédito vehicular condicionado - criterios no cumplidos'),

-- R031 - Crédito con Codeudor
('FALLA_NO_APLICA_CREDITO_CON_CODEUDOR', 'No aplica para crédito con codeudor - criterios no cumplidos'),

-- R032 - Microcrédito
('FALLA_NO_APLICA_MICROCREDITO', 'No aplica para microcrédito - criterios no cumplidos');

-- FAILURES DE VALIDACIÓN NORMATIVA (R040-R042)
INSERT INTO sys.failures (name, description) VALUES
-- R040 - Validación SARLAFT
('FALLA_ACTIVIDAD_ALTO_RIESGO_SARLAFT', 'Actividad económica de alto riesgo LA/FT - Código: NORM001'),

-- R041 - Validación PEP
('FALLA_PERSONA_PEP_SIN_APROBACION', 'Requiere aprobación de comité especial para PEP - Código: NORM002'),

-- R042 - Múltiples Consultas
('FALLA_MULTIPLES_CONSULTAS', 'Múltiples consultas simultáneas detectadas - Código: NORM003');

-- FAILURES DE CONDICIONES ESPECIALES (R050-R052)
INSERT INTO sys.failures (name, description) VALUES
-- R050 - Cliente Preferencial
('FALLA_NO_APLICA_CLIENTE_PREFERENCIAL', 'No aplica para beneficios de cliente preferencial'),

-- R051 - Empleado Empresa Convenio
('FALLA_NO_APLICA_CREDITO_NOMINA', 'No aplica para crédito de nómina - no es empleado de empresa convenio'),

-- R052 - Pensionado
('FALLA_NO_APLICA_CREDITO_PENSIONADOS', 'No aplica para crédito de pensionados - criterios no cumplidos');

-- FAILURES ADICIONALES PARA CASOS ESPECIALES
INSERT INTO sys.failures (name, description) VALUES
-- Failures para casos de zona gris
('FALLA_CASO_ZONA_GRIS', 'Caso en zona gris - requiere revisión manual'),

-- Failures para inconsistencias
('FALLA_INFORMACION_INCONSISTENTE', 'Información inconsistente detectada - requiere verificación adicional'),

-- Failures para documentación
('FALLA_DOCUMENTACION_INCOMPLETA', 'Documentación incompleta o no verificable'),

-- Failures para verificación externa
('FALLA_VERIFICACION_EXTERNA_FALLIDA', 'Verificación externa fallida'),

-- Failures para cumplimiento normativo
('FALLA_CUMPLIMIENTO_NORMATIVO', 'No cumple con normativa aplicable'),

-- Failures para capacidad de pago
('FALLA_CAPACIDAD_PAGO_INSUFICIENTE', 'Capacidad de pago insuficiente'),

-- Failures para estabilidad laboral
('FALLA_ESTABILIDAD_LABORAL_INSUFICIENTE', 'Estabilidad laboral insuficiente'),

-- Failures para historial crediticio
('FALLA_HISTORIAL_CREDITICIO_DEFICIENTE', 'Historial crediticio deficiente'),

-- Failures para comportamiento de pago
('FALLA_COMPORTAMIENTO_PAGO_DEFICIENTE', 'Comportamiento de pago deficiente'),

-- Failures para concentración de riesgo
('FALLA_CONCENTRACION_RIESGO', 'Concentración de riesgo detectada'),

-- Failures para refinanciaciones
('FALLA_REFINANCIACIONES_EXCESIVAS', 'Refinanciaciones excesivas detectadas'),

-- Failures para zona geográfica
('FALLA_ZONA_ALTO_RIESGO', 'Zona geográfica de alto riesgo'),

-- Failures para actividad económica
('FALLA_ACTIVIDAD_ECONOMICA_RIESGOSA', 'Actividad económica de alto riesgo'),

-- Failures para consultas excesivas
('FALLA_CONSULTAS_EXCESIVAS', 'Consultas excesivas en centrales de riesgo'),

-- Failures para mora histórica
('FALLA_MORA_HISTORICA_SIGNIFICATIVA', 'Mora histórica significativa'),

-- Failures para obligaciones vigentes
('FALLA_OBLIGACIONES_VIGENTES_EXCESIVAS', 'Obligaciones vigentes excesivas'),

-- Failures para patrimonio insuficiente
('FALLA_PATRIMONIO_INSUFICIENTE', 'Patrimonio insuficiente para el monto solicitado'),

-- Failures para ahorros insuficientes
('FALLA_AHORROS_INSUFICIENTES', 'Ahorros insuficientes'),

-- Failures para ingresos adicionales
('FALLA_INGRESOS_ADICIONALES_INSUFICIENTES', 'Ingresos adicionales insuficientes'),

-- Failures para finalidad del crédito
('FALLA_FINALIDAD_CREDITO_NO_VALIDA', 'Finalidad del crédito no válida'),

-- Failures para monto solicitado
('FALLA_MONTO_SOLICITADO_EXCESIVO', 'Monto solicitado excesivo para el perfil'),

-- Failures para plazo solicitado
('FALLA_PLAZO_SOLICITADO_EXCESIVO', 'Plazo solicitado excesivo para el perfil'),

-- Failures para garantías
('FALLA_GARANTIAS_INSUFICIENTES', 'Garantías insuficientes para el crédito'),

-- Failures para codeudor
('FALLA_CODEUDOR_NO_CALIFICA', 'Codeudor no califica para el crédito'),

-- Failures para seguro
('FALLA_SEGURO_REQUERIDO', 'Seguro requerido no disponible'),

-- Failures para capacitación
('FALLA_CAPACITACION_FINANCIERA_REQUERIDA', 'Capacitación financiera requerida no completada'),

-- Failures para reporte UIAF
('FALLA_REPORTE_UIAF_REQUERIDO', 'Reporte UIAF requerido no presentado'),

-- Failures para período de restricción
('FALLA_PERIODO_RESTRICCION_ACTIVO', 'Período de restricción activo'),

-- Failures para aprobación manual
('FALLA_REQUIERE_APROBACION_MANUAL', 'Requiere aprobación manual del comité'),

-- Failures para evaluación conjunta
('FALLA_EVALUACION_CONJUNTA_FALLIDA', 'Evaluación conjunta con codeudor fallida'),

-- Failures para descuento nómina
('FALLA_DESCUENTO_NOMINA_NO_AUTORIZADO', 'Descuento por nómina no autorizado'),

-- Failures para descuento mesada
('FALLA_DESCUENTO_MESADA_EXCESIVO', 'Descuento por mesada excesivo'),

-- Failures para tramite express
('FALLA_TRAMITE_EXPRESS_NO_DISPONIBLE', 'Trámite express no disponible'),

-- Failures para tasa preferencial
('FALLA_TASA_PREFERENCIAL_NO_APLICA', 'Tasa preferencial no aplica'),

-- Failures para aprobación automática
('FALLA_APROBACION_AUTOMATICA_FALLIDA', 'Aprobación automática fallida'),

-- Failures para beneficio preferencial
('FALLA_BENEFICIO_PREFERENCIAL_NO_APLICA', 'Beneficio preferencial no aplica'),

-- Failures para descuento tasa
('FALLA_DESCUENTO_TASA_NO_APLICA', 'Descuento de tasa no aplica');
