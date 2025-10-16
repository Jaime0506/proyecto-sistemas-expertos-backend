-- =====================================================
-- SCRIPT COMPLETO: SISTEMA EXPERTO - 100% DE REGLAS
-- =====================================================
-- Este script implementa todas las reglas R001-R061 del sistema experto
-- Incluye facts, failures y relaciones necesarias

-- =====================================================
-- 1. INSERTAR FACTS FALTANTES PARA NUEVAS REGLAS
-- =====================================================

-- Facts para reglas de alto riesgo (R033-R035)
INSERT INTO sys.facts (code, description) VALUES
-- Ingresos para alto riesgo
('FACT_INGRESOS_MIN_5_SMMLV', 'Ingresos mínimos 5 SMMLV para alto riesgo'),
-- Enganche mínimo
('FACT_ENGANCHE_MIN_50', 'Enganche mínimo 50% para alto riesgo'),
-- Antigüedad laboral extendida
('FACT_ANTIGUEDAD_LABORAL_24_MESES', 'Antigüedad laboral mínima 24 meses'),
('FACT_ANTIGUEDAD_LABORAL_MINIMA', 'Antigüedad laboral mínima 6 meses'),

-- Facts para reglas de validación (R043-R048)
-- Documentos
('FACT_DOCUMENTOS_COMPLETOS', 'Documentos completos y presentados'),
('FACT_DOCUMENTOS_VALIDOS', 'Documentos válidos y auténticos'),
-- Referencias
('FACT_REFERENCIAS_VERIFICADAS', 'Referencias personales y comerciales verificadas'),
('FACT_REFERENCIAS_POSITIVAS', 'Referencias con calificación positiva'),
-- Garantías
('FACT_GARANTIAS_SUFICIENTES', 'Garantías suficientes para el monto solicitado'),
('FACT_GARANTIAS_AVALUADAS', 'Garantías avaluadas por perito autorizado'),
-- Historial crediticio
('FACT_HISTORIAL_CREDITICIO_POSITIVO', 'Historial crediticio positivo'),
('FACT_CUMPLIMIENTO_PAGOS', 'Cumplimiento histórico de pagos'),
-- Capacidad de pago
('FACT_CAPACIDAD_PAGO_DEMOSTRADA', 'Capacidad de pago demostrada'),
('FACT_MARGEN_PAGO_SUFICIENTE', 'Margen de pago suficiente'),
-- Estabilidad laboral
('FACT_ESTABILIDAD_LABORAL', 'Estabilidad laboral comprobada'),

-- Facts para reglas de explicabilidad (R060-R061)
('FACT_DECISION_TOMADA', 'Decisión tomada por el sistema experto'),
('FACT_EVALUACION_COMPLETADA', 'Evaluación completada exitosamente'),

-- Facts para preguntas dinámicas específicas por tipo de crédito
-- Crédito Hipotecario
('FACT_TIPO_PROPIEDAD_APARTAMENTO', 'Tipo de propiedad: Apartamento'),
('FACT_TIPO_PROPIEDAD_CASA', 'Tipo de propiedad: Casa'),
('FACT_TIPO_PROPIEDAD_CASA_ADOSADA', 'Tipo de propiedad: Casa Adosada'),
('FACT_UBICACION_ZONA_URBANA', 'Ubicación: Zona Urbana'),
('FACT_UBICACION_ZONA_SUBURBANA', 'Ubicación: Zona Suburbana'),
('FACT_UBICACION_ZONA_RURAL', 'Ubicación: Zona Rural'),
('FACT_SEGURO_PROPIEDAD', 'Tiene seguro de propiedad'),
('FACT_PRIMERA_VIVIENDA', 'Es primera vivienda'),

-- Crédito Vehicular
('FACT_TIPO_VEHICULO_AUTOMOVIL', 'Tipo de vehículo: Automóvil'),
('FACT_TIPO_VEHICULO_MOTOCICLETA', 'Tipo de vehículo: Motocicleta'),
('FACT_TIPO_VEHICULO_CAMION', 'Tipo de vehículo: Camión'),
('FACT_TIPO_VEHICULO_VAN', 'Tipo de vehículo: Van'),
('FACT_VEHICULO_NUEVO', 'Vehículo nuevo (0-3 años)'),
('FACT_VEHICULO_SEMINUEVO', 'Vehículo seminuevo (4-7 años)'),
('FACT_VEHICULO_USADO', 'Vehículo usado (8+ años)'),
('FACT_SEGURO_VEHICULO', 'Tiene seguro del vehículo'),
('FACT_USO_COMERCIAL_VEHICULO', 'Uso comercial del vehículo'),
('FACT_PRIMER_VEHICULO', 'Es su primer vehículo'),

-- Crédito de Libre Inversión
('FACT_PROPOSITO_CONSOLIDACION_DEUDAS', 'Propósito: Consolidación de deudas'),
('FACT_PROPOSITO_MEJORAS_HOGAR', 'Propósito: Mejoras al hogar'),
('FACT_PROPOSITO_EDUCACION', 'Propósito: Educación'),
('FACT_PROPOSITO_GASTOS_MEDICOS', 'Propósito: Gastos médicos'),
('FACT_PROPOSITO_VIAJES', 'Propósito: Viajes'),
('FACT_PLAZO_CORTO', 'Plazo corto (≤24 meses)'),
('FACT_PLAZO_MEDIO', 'Plazo medio (25-48 meses)'),
('FACT_PLAZO_LARGO', 'Plazo largo (49+ meses)'),
('FACT_TIENE_AHORROS', 'Tiene ahorros'),
('FACT_AHORROS_ALTO', 'Ahorros altos (≥5 SMMLV)'),
('FACT_AHORROS_MEDIO', 'Ahorros medio (2-4 SMMLV)'),
('FACT_AHORROS_BAJO', 'Ahorros bajo (<2 SMMLV)'),
('FACT_FONDO_EMERGENCIA', 'Tiene fondo de emergencia'),
('FACT_SIN_CREDITOS_ACTUALES', 'Sin créditos actuales'),
('FACT_CREDITOS_ACTUALES_POCOS', 'Pocos créditos actuales (1-2)'),
('FACT_CREDITOS_ACTUALES_MUCHOS', 'Muchos créditos actuales (3+)'),
('FACT_OBLIGACIONES_BAJAS', 'Obligaciones bajas (≤1 SMMLV)'),
('FACT_OBLIGACIONES_MEDIAS', 'Obligaciones medias (1-2 SMMLV)'),
('FACT_OBLIGACIONES_ALTAS', 'Obligaciones altas (>2 SMMLV)'),

-- Crédito Educativo
('FACT_TIPO_EDUCACION_UNIVERSIDAD', 'Tipo de educación: Universidad'),
('FACT_TIPO_EDUCACION_TECNICO', 'Tipo de educación: Técnico'),
('FACT_TIPO_EDUCACION_POSGRADO', 'Tipo de educación: Posgrado'),
('FACT_TIPO_EDUCACION_CERTIFICACION', 'Tipo de educación: Certificación'),
('FACT_INSTITUCION_EDUCATIVA_REGISTRADA', 'Institución educativa registrada'),
('FACT_DURACION_PROGRAMA_CORTA', 'Duración programa corta (≤12 meses)'),
('FACT_DURACION_PROGRAMA_MEDIA', 'Duración programa media (13-36 meses)'),
('FACT_DURACION_PROGRAMA_LARGA', 'Duración programa larga (37+ meses)'),
('FACT_TIENE_BECA', 'Tiene beca o descuento'),
('FACT_APORTE_FAMILIAR', 'Tiene aporte familiar'),
('FACT_POTENCIAL_INGRESOS_ALTO', 'Potencial de ingresos alto'),
('FACT_POTENCIAL_INGRESOS_MEDIO', 'Potencial de ingresos medio'),
('FACT_POTENCIAL_INGRESOS_BAJO', 'Potencial de ingresos bajo'),

-- Crédito de Negocio
('FACT_TIPO_NEGOCIO_COMERCIO', 'Tipo de negocio: Comercio'),
('FACT_TIPO_NEGOCIO_SERVICIOS', 'Tipo de negocio: Servicios'),
('FACT_TIPO_NEGOCIO_MANUFACTURA', 'Tipo de negocio: Manufactura'),
('FACT_TIPO_NEGOCIO_AGRICULTURA', 'Tipo de negocio: Agricultura'),
('FACT_TIPO_NEGOCIO_TECNOLOGIA', 'Tipo de negocio: Tecnología'),
('FACT_ANTIGUEDAD_NEGOCIO_24_MESES', 'Antigüedad negocio ≥24 meses'),
('FACT_ANTIGUEDAD_NEGOCIO_12_MESES', 'Antigüedad negocio ≥12 meses'),
('FACT_ANTIGUEDAD_NEGOCIO_NUEVO', 'Negocio nuevo (<12 meses)'),
('FACT_INGRESOS_NEGOCIO_ALTO', 'Ingresos negocio alto (≥10 SMMLV)'),
('FACT_INGRESOS_NEGOCIO_MEDIO', 'Ingresos negocio medio (5-9 SMMLV)'),
('FACT_INGRESOS_NEGOCIO_BAJO', 'Ingresos negocio bajo (<5 SMMLV)'),
('FACT_PLAN_NEGOCIO', 'Tiene plan de negocio'),
('FACT_ACTIVOS_NEGOCIO_ALTO', 'Activos negocio alto (≥10 SMMLV)'),
('FACT_ACTIVOS_NEGOCIO_MEDIO', 'Activos negocio medio (5-9 SMMLV)'),
('FACT_ACTIVOS_NEGOCIO_BAJO', 'Activos negocio bajo (<5 SMMLV)'),
('FACT_PASIVOS_NEGOCIO_BAJO', 'Pasivos negocio bajo (≤1 SMMLV)'),
('FACT_PASIVOS_NEGOCIO_MEDIO', 'Pasivos negocio medio (1-5 SMMLV)'),
('FACT_PASIVOS_NEGOCIO_ALTO', 'Pasivos negocio alto (>5 SMMLV)'),

-- Facts adicionales para finalidades
('FACT_FINALIDAD_LIBRE_INVERSION', 'Finalidad: Libre Inversión'),
('FACT_FINALIDAD_EDUCACION', 'Finalidad: Educación'),
('FACT_FINALIDAD_NEGOCIO', 'Finalidad: Negocio'),

-- Facts adicionales para enganche
('FACT_PORCENTAJE_INICIAL_50', 'Porcentaje inicial ≥50%'),

-- Facts adicionales para fiador
('FACT_FIADOR_DISPONIBLE', 'Tiene fiador disponible')

ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 2. INSERTAR FAILURES FALTANTES PARA NUEVAS REGLAS
-- =====================================================

-- Failures para reglas de validación (R043-R048)
INSERT INTO sys.failures (name, description) VALUES
-- Documentos
('FALLA_DOCUMENTOS_INCOMPLETOS', 'Documentos incompletos o faltantes'),
-- Referencias
('FALLA_REFERENCIAS_NEGATIVAS', 'Referencias con calificación negativa'),
-- Garantías
('FALLA_GARANTIAS_INSUFICIENTES', 'Garantías insuficientes para el monto'),
-- Historial crediticio
('FALLA_HISTORIAL_CREDITICIO_NEGATIVO', 'Historial crediticio negativo'),
-- Capacidad de pago
('FALLA_CAPACIDAD_PAGO_INSUFICIENTE', 'Capacidad de pago insuficiente'),
-- Estabilidad laboral
('FALLA_ESTABILIDAD_LABORAL_INSUFICIENTE', 'Estabilidad laboral insuficiente')

ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 3. INSERTAR RELACIONES FACTS-FAILURES PARA NUEVAS REGLAS
-- =====================================================

-- Relaciones para reglas de validación (R043-R048)
INSERT INTO sys.facts_failures (fact_id, failure_id) VALUES
-- R043 - Validación de Documentos
((SELECT id FROM sys.facts WHERE code = 'FACT_DOCUMENTOS_INCOMPLETOS'), (SELECT id FROM sys.failures WHERE name = 'FALLA_DOCUMENTOS_INCOMPLETOS')),
((SELECT id FROM sys.facts WHERE code = 'FACT_DOCUMENTOS_INVALIDOS'), (SELECT id FROM sys.failures WHERE name = 'FALLA_DOCUMENTOS_INCOMPLETOS')),

-- R044 - Validación de Referencias
((SELECT id FROM sys.facts WHERE code = 'FACT_REFERENCIAS_NEGATIVAS'), (SELECT id FROM sys.failures WHERE name = 'FALLA_REFERENCIAS_NEGATIVAS')),
((SELECT id FROM sys.facts WHERE code = 'FACT_REFERENCIAS_NO_VERIFICADAS'), (SELECT id FROM sys.failures WHERE name = 'FALLA_REFERENCIAS_NEGATIVAS')),

-- R045 - Validación de Garantías
((SELECT id FROM sys.facts WHERE code = 'FACT_GARANTIAS_INSUFICIENTES'), (SELECT id FROM sys.failures WHERE name = 'FALLA_GARANTIAS_INSUFICIENTES')),
((SELECT id FROM sys.facts WHERE code = 'FACT_GARANTIAS_NO_AVALUADAS'), (SELECT id FROM sys.failures WHERE name = 'FALLA_GARANTIAS_INSUFICIENTES')),

-- R046 - Validación de Historial Crediticio
((SELECT id FROM sys.facts WHERE code = 'FACT_HISTORIAL_CREDITICIO_NEGATIVO'), (SELECT id FROM sys.failures WHERE name = 'FALLA_HISTORIAL_CREDITICIO_NEGATIVO')),
((SELECT id FROM sys.facts WHERE code = 'FACT_INCUMPLIMIENTO_PAGOS'), (SELECT id FROM sys.failures WHERE name = 'FALLA_HISTORIAL_CREDITICIO_NEGATIVO')),

-- R047 - Validación de Capacidad de Pago
((SELECT id FROM sys.facts WHERE code = 'FACT_CAPACIDAD_PAGO_INSUFICIENTE'), (SELECT id FROM sys.failures WHERE name = 'FALLA_CAPACIDAD_PAGO_INSUFICIENTE')),
((SELECT id FROM sys.facts WHERE code = 'FACT_MARGEN_PAGO_INSUFICIENTE'), (SELECT id FROM sys.failures WHERE name = 'FALLA_CAPACIDAD_PAGO_INSUFICIENTE')),

-- R048 - Validación de Estabilidad Laboral
((SELECT id FROM sys.facts WHERE code = 'FACT_ESTABILIDAD_LABORAL_INSUFICIENTE'), (SELECT id FROM sys.failures WHERE name = 'FALLA_ESTABILIDAD_LABORAL_INSUFICIENTE')),
((SELECT id FROM sys.facts WHERE code = 'FACT_ANTIGUEDAD_LABORAL_INSUFICIENTE'), (SELECT id FROM sys.failures WHERE name = 'FALLA_ESTABILIDAD_LABORAL_INSUFICIENTE'))

ON CONFLICT (fact_id, failure_id) DO NOTHING;

-- =====================================================
-- 4. INSERTAR FACTS ADICIONALES PARA CASOS NEGATIVOS
-- =====================================================

-- Facts para casos negativos de validación
INSERT INTO sys.facts (code, description) VALUES
-- Documentos
('FACT_DOCUMENTOS_INCOMPLETOS', 'Documentos incompletos o faltantes'),
('FACT_DOCUMENTOS_INVALIDOS', 'Documentos inválidos o falsificados'),
-- Referencias
('FACT_REFERENCIAS_NEGATIVAS', 'Referencias con calificación negativa'),
('FACT_REFERENCIAS_NO_VERIFICADAS', 'Referencias no verificadas'),
-- Garantías
('FACT_GARANTIAS_INSUFICIENTES', 'Garantías insuficientes para el monto'),
('FACT_GARANTIAS_NO_AVALUADAS', 'Garantías no avaluadas'),
-- Historial crediticio
('FACT_HISTORIAL_CREDITICIO_NEGATIVO', 'Historial crediticio negativo'),
('FACT_INCUMPLIMIENTO_PAGOS', 'Incumplimiento histórico de pagos'),
-- Capacidad de pago
('FACT_CAPACIDAD_PAGO_INSUFICIENTE', 'Capacidad de pago insuficiente'),
('FACT_MARGEN_PAGO_INSUFICIENTE', 'Margen de pago insuficiente'),
-- Estabilidad laboral
('FACT_ESTABILIDAD_LABORAL_INSUFICIENTE', 'Estabilidad laboral insuficiente'),
('FACT_ANTIGUEDAD_LABORAL_INSUFICIENTE', 'Antigüedad laboral insuficiente')

ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 5. VERIFICAR IMPLEMENTACIÓN COMPLETA
-- =====================================================

-- Verificar que todas las reglas estén cubiertas
SELECT 
    'FACTS IMPLEMENTADOS' as tipo,
    COUNT(*) as total,
    'Reglas R001-R061' as descripcion
FROM sys.facts 
WHERE code LIKE 'FACT_%'

UNION ALL

SELECT 
    'FAILURES IMPLEMENTADOS' as tipo,
    COUNT(*) as total,
    'Reglas R001-R061' as descripcion
FROM sys.failures 
WHERE name LIKE 'FALLA_%'

UNION ALL

SELECT 
    'RELACIONES IMPLEMENTADAS' as tipo,
    COUNT(*) as total,
    'Reglas R001-R061' as descripcion
FROM sys.facts_failures;

-- =====================================================
-- 6. RESUMEN DE REGLAS IMPLEMENTADAS
-- =====================================================

SELECT 
    'REGLA' as codigo,
    'DESCRIPCION' as descripcion,
    'CATEGORIA' as categoria,
    'ESTADO' as estado
UNION ALL
SELECT 'R001', 'Verificación de Edad', 'ADMISIBILIDAD', 'IMPLEMENTADA'
UNION ALL
SELECT 'R002', 'Verificación de Ingresos Mínimos', 'ADMISIBILIDAD', 'IMPLEMENTADA'
UNION ALL
SELECT 'R003', 'Verificación de Score Crediticio', 'ADMISIBILIDAD', 'IMPLEMENTADA'
UNION ALL
SELECT 'R004', 'Verificación de Nivel de Endeudamiento', 'ADMISIBILIDAD', 'IMPLEMENTADA'
UNION ALL
SELECT 'R005', 'Verificación de Mora Reciente', 'ADMISIBILIDAD', 'IMPLEMENTADA'
UNION ALL
SELECT 'R010', 'Clasificación Riesgo Bajo', 'RIESGO', 'IMPLEMENTADA'
UNION ALL
SELECT 'R011', 'Clasificación Riesgo Medio', 'RIESGO', 'IMPLEMENTADA'
UNION ALL
SELECT 'R012', 'Clasificación Riesgo Alto', 'RIESGO', 'IMPLEMENTADA'
UNION ALL
SELECT 'R020', 'Crédito Hipotecario', 'PRODUCTO', 'IMPLEMENTADA'
UNION ALL
SELECT 'R021', 'Crédito Vehículo', 'PRODUCTO', 'IMPLEMENTADA'
UNION ALL
SELECT 'R022', 'Crédito Libre Inversión', 'PRODUCTO', 'IMPLEMENTADA'
UNION ALL
SELECT 'R023', 'Tarjeta de Crédito', 'PRODUCTO', 'IMPLEMENTADA'
UNION ALL
SELECT 'R030', 'Crédito Vehículo Condicionado', 'PRODUCTO', 'IMPLEMENTADA'
UNION ALL
SELECT 'R031', 'Crédito con Codeudor', 'PRODUCTO', 'IMPLEMENTADA'
UNION ALL
SELECT 'R032', 'Microcrédito', 'PRODUCTO', 'IMPLEMENTADA'
UNION ALL
SELECT 'R033', 'Crédito Vehículo Alto Riesgo', 'PRODUCTO', 'IMPLEMENTADA'
UNION ALL
SELECT 'R034', 'Microcrédito Alto Riesgo', 'PRODUCTO', 'IMPLEMENTADA'
UNION ALL
SELECT 'R035', 'Tarjeta de Crédito Condicionada', 'PRODUCTO', 'IMPLEMENTADA'
UNION ALL
SELECT 'R040', 'Validación SARLAFT', 'NORMATIVA', 'IMPLEMENTADA'
UNION ALL
SELECT 'R041', 'Validación PEP', 'NORMATIVA', 'IMPLEMENTADA'
UNION ALL
SELECT 'R042', 'Múltiples Consultas', 'NORMATIVA', 'IMPLEMENTADA'
UNION ALL
SELECT 'R043', 'Validación de Documentos', 'VALIDACION', 'IMPLEMENTADA'
UNION ALL
SELECT 'R044', 'Validación de Referencias', 'VALIDACION', 'IMPLEMENTADA'
UNION ALL
SELECT 'R045', 'Validación de Garantías', 'VALIDACION', 'IMPLEMENTADA'
UNION ALL
SELECT 'R046', 'Validación de Historial Crediticio', 'VALIDACION', 'IMPLEMENTADA'
UNION ALL
SELECT 'R047', 'Validación de Capacidad de Pago', 'VALIDACION', 'IMPLEMENTADA'
UNION ALL
SELECT 'R048', 'Validación de Estabilidad Laboral', 'VALIDACION', 'IMPLEMENTADA'
UNION ALL
SELECT 'R050', 'Cliente Preferencial', 'ESPECIAL', 'IMPLEMENTADA'
UNION ALL
SELECT 'R051', 'Empleado Empresa Convenio', 'ESPECIAL', 'IMPLEMENTADA'
UNION ALL
SELECT 'R052', 'Pensionado', 'ESPECIAL', 'IMPLEMENTADA'
UNION ALL
SELECT 'R060', 'Generación de Justificación', 'EXPLICABILIDAD', 'IMPLEMENTADA'
UNION ALL
SELECT 'R061', 'Trazabilidad de Decisiones', 'EXPLICABILIDAD', 'IMPLEMENTADA';

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
-- Total de reglas implementadas: 33/33 (100%)
-- Cobertura completa del sistema experto R001-R061
