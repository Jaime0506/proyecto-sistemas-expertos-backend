BEGIN;

-- Agregar columna success_action si no existe
ALTER TABLE sys.rules ADD COLUMN IF NOT EXISTS success_action VARCHAR(100);

INSERT INTO sys.rules (code, name, category, priority, failure_id, logic_type, description, success_action) VALUES
('R001', 'Verificación de Edad', 'ADMISIBILIDAD', 1, (SELECT id FROM sys.failures WHERE name = 'FALLA_EDAD_FUERA_RANGO' LIMIT 1), 'AND', 'Verificar que la edad esté entre 18 y 75 años', NULL),
('R002', 'Verificación de Ingresos Mínimos', 'ADMISIBILIDAD', 2, (SELECT id FROM sys.failures WHERE name = 'FALLA_INGRESOS_INSUFICIENTES' LIMIT 1), 'AND', 'Verificar ingresos mínimos de 1 SMMLV', NULL),
('R003', 'Verificación de Score Crediticio', 'ADMISIBILIDAD', 3, (SELECT id FROM sys.failures WHERE name = 'FALLA_SCORE_INSUFICIENTE' LIMIT 1), 'AND', 'Verificar score crediticio mínimo de 300 puntos', NULL),
('R004', 'Verificación de Nivel de Endeudamiento', 'ADMISIBILIDAD', 4, (SELECT id FROM sys.failures WHERE name = 'FALLA_ENDEUDAMIENTO_EXCESIVO' LIMIT 1), 'AND', 'Verificar que el endeudamiento no exceda el 50%', NULL),
('R005', 'Verificación de Mora Reciente', 'ADMISIBILIDAD', 5, (SELECT id FROM sys.failures WHERE name = 'FALLA_MORA_RECIENTE_SIGNIFICATIVA' LIMIT 1), 'AND', 'Verificar que la mora no exceda 90 días', NULL),
('R010', 'Clasificación Riesgo Bajo', 'RIESGO', 10, (SELECT id FROM sys.failures LIMIT 1), 'AND', 'Clasificar como riesgo bajo', 'RIESGO_BAJO'),
('R011', 'Clasificación Riesgo Medio', 'RIESGO', 11, (SELECT id FROM sys.failures LIMIT 1), 'AND', 'Clasificar como riesgo medio', 'RIESGO_MEDIO'),
('R012', 'Clasificación Riesgo Alto', 'RIESGO', 12, (SELECT id FROM sys.failures LIMIT 1), 'AND', 'Clasificar como riesgo alto', 'RIESGO_ALTO'),
('R020', 'Crédito Hipotecario', 'PRODUCTO', 20, (SELECT id FROM sys.failures LIMIT 1), 'AND', 'Recomendar crédito hipotecario', 'CREDITO_HIPOTECARIO'),
('R021', 'Crédito Vehículo', 'PRODUCTO', 21, (SELECT id FROM sys.failures LIMIT 1), 'AND', 'Recomendar crédito vehicular', 'CREDITO_VEHICULO'),
('R022', 'Crédito Libre Inversión', 'PRODUCTO', 22, (SELECT id FROM sys.failures LIMIT 1), 'AND', 'Recomendar crédito de libre inversión', 'CREDITO_LIBRE_INVERSION'),
('R023', 'Tarjeta de Crédito', 'PRODUCTO', 23, (SELECT id FROM sys.failures LIMIT 1), 'AND', 'Recomendar tarjeta de crédito', 'TARJETA_CREDITO'),
('R030', 'Crédito Vehículo Condicionado', 'PRODUCTO', 30, (SELECT id FROM sys.failures LIMIT 1), 'AND', 'Recomendar crédito vehicular condicionado', 'CREDITO_VEHICULO_CONDICIONADO'),
('R031', 'Crédito con Codeudor', 'PRODUCTO', 31, (SELECT id FROM sys.failures LIMIT 1), 'AND', 'Recomendar crédito con codeudor', 'CREDITO_CON_CODEUDOR'),
('R032', 'Microcrédito', 'PRODUCTO', 32, (SELECT id FROM sys.failures LIMIT 1), 'AND', 'Recomendar microcrédito', 'MICROCREDITO'),
('R033', 'Crédito Vehículo Alto Riesgo', 'PRODUCTO', 33, (SELECT id FROM sys.failures LIMIT 1), 'AND', 'Recomendar crédito vehicular para alto riesgo', 'CREDITO_VEHICULO_ALTO_RIESGO'),
('R034', 'Microcrédito Alto Riesgo', 'PRODUCTO', 34, (SELECT id FROM sys.failures LIMIT 1), 'AND', 'Recomendar microcrédito para alto riesgo', 'MICROCREDITO_ALTO_RIESGO'),
('R035', 'Tarjeta de Crédito Condicionada', 'PRODUCTO', 35, (SELECT id FROM sys.failures LIMIT 1), 'AND', 'Recomendar tarjeta de crédito condicionada', 'TARJETA_CREDITO_CONDICIONADA'),
('R040', 'Validación SARLAFT', 'NORMATIVA', 40, (SELECT id FROM sys.failures WHERE name = 'FALLA_ACTIVIDAD_ALTO_RIESGO_SARLAFT' LIMIT 1), 'AND', 'Validar actividades de alto riesgo SARLAFT', NULL),
('R041', 'Validación PEP', 'NORMATIVA', 41, (SELECT id FROM sys.failures WHERE name = 'FALLA_PERSONA_PEP_SIN_APROBACION' LIMIT 1), 'AND', 'Validar personas políticamente expuestas', NULL),
('R042', 'Múltiples Consultas', 'NORMATIVA', 42, (SELECT id FROM sys.failures WHERE name = 'FALLA_MULTIPLES_CONSULTAS' LIMIT 1), 'AND', 'Detectar múltiples consultas simultáneas', NULL),
('R043', 'Validación de Documentos', 'VALIDACION', 43, (SELECT id FROM sys.failures WHERE name = 'FALLA_DOCUMENTOS_INCOMPLETOS' LIMIT 1), 'AND', 'Validar completitud y validez de documentos', NULL),
('R044', 'Validación de Referencias', 'VALIDACION', 44, (SELECT id FROM sys.failures WHERE name = 'FALLA_REFERENCIAS_NEGATIVAS' LIMIT 1), 'AND', 'Validar referencias personales y comerciales', NULL),
('R045', 'Validación de Garantías', 'VALIDACION', 45, (SELECT id FROM sys.failures WHERE name = 'FALLA_GARANTIAS_INSUFICIENTES' LIMIT 1), 'AND', 'Validar suficiencia y avalúo de garantías', NULL),
('R046', 'Validación de Historial Crediticio', 'VALIDACION', 46, (SELECT id FROM sys.failures WHERE name = 'FALLA_HISTORIAL_CREDITICIO_NEGATIVO' LIMIT 1), 'AND', 'Validar historial crediticio y cumplimiento de pagos', NULL),
('R047', 'Validación de Capacidad de Pago', 'VALIDACION', 47, (SELECT id FROM sys.failures WHERE name = 'FALLA_CAPACIDAD_PAGO_INSUFICIENTE' LIMIT 1), 'AND', 'Validar capacidad de pago del solicitante', NULL),
('R048', 'Validación de Estabilidad Laboral', 'VALIDACION', 48, (SELECT id FROM sys.failures WHERE name = 'FALLA_ESTABILIDAD_LABORAL_INSUFICIENTE' LIMIT 1), 'OR', 'Validar estabilidad y antigüedad laboral', NULL),
('R050', 'Cliente Preferencial', 'ESPECIAL', 50, (SELECT id FROM sys.failures LIMIT 1), 'AND', 'Aplicar beneficios de cliente preferencial', 'CLIENTE_PREFERENCIAL'),
('R051', 'Empleado Empresa Convenio', 'ESPECIAL', 51, (SELECT id FROM sys.failures LIMIT 1), 'AND', 'Aplicar crédito de nómina', 'CREDITO_NOMINA'),
('R052', 'Pensionado', 'ESPECIAL', 52, (SELECT id FROM sys.failures LIMIT 1), 'AND', 'Aplicar crédito para pensionados', 'CREDITO_PENSIONADOS'),
('R060', 'Generación de Justificación', 'EXPLICABILIDAD', 60, (SELECT id FROM sys.failures LIMIT 1), 'AND', 'Generar explicación detallada de la decisión', NULL),
('R061', 'Trazabilidad de Decisiones', 'EXPLICABILIDAD', 61, (SELECT id FROM sys.failures LIMIT 1), 'AND', 'Registrar trazabilidad completa de la evaluación', NULL)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    priority = EXCLUDED.priority,
    description = EXCLUDED.description,
    success_action = EXCLUDED.success_action;

INSERT INTO sys.rule_facts (rule_id, fact_id, position)
SELECT r.id, f.id, 
    CASE 
        WHEN r.code = 'R001' AND f.code = 'FACT_EDAD_18_75' THEN 0
        WHEN r.code = 'R002' AND f.code = 'FACT_INGRESOS_MIN_1_SMMLV' THEN 0
        WHEN r.code = 'R003' AND f.code = 'FACT_SCORE_MIN_300' THEN 0
        WHEN r.code = 'R004' AND f.code = 'FACT_ENDEUDAMIENTO_MAX_50' THEN 0
        WHEN r.code = 'R005' AND f.code = 'FACT_MORA_MAX_90_DIAS' THEN 0
        WHEN r.code = 'R010' AND f.code = 'FACT_SCORE_700_PLUS' THEN 0
        WHEN r.code = 'R010' AND f.code = 'FACT_MORA_MAX_30_DIAS' THEN 1
        WHEN r.code = 'R011' AND f.code = 'FACT_SCORE_500_699' THEN 0
        WHEN r.code = 'R011' AND f.code = 'FACT_MORA_MAX_60_DIAS' THEN 1
        WHEN r.code = 'R012' AND f.code = 'FACT_SCORE_300_499' THEN 0
        WHEN r.code = 'R020' AND f.code = 'FACT_PERFIL_RIESGO_BAJO' THEN 0
        WHEN r.code = 'R020' AND f.code = 'FACT_FINALIDAD_VIVIENDA' THEN 1
        WHEN r.code = 'R020' AND f.code = 'FACT_INGRESOS_MIN_4_SMMLV' THEN 2
        WHEN r.code = 'R020' AND f.code = 'FACT_CUOTA_MAX_30_INGRESOS' THEN 3
        WHEN r.code = 'R021' AND f.code = 'FACT_PERFIL_RIESGO_BAJO' THEN 0
        WHEN r.code = 'R021' AND f.code = 'FACT_FINALIDAD_VEHICULO' THEN 1
        WHEN r.code = 'R021' AND f.code = 'FACT_INGRESOS_MIN_3_SMMLV' THEN 2
        WHEN r.code = 'R021' AND f.code = 'FACT_CUOTA_MAX_40_INGRESOS' THEN 3
        WHEN r.code = 'R022' AND f.code = 'FACT_PERFIL_RIESGO_BAJO' THEN 0
        WHEN r.code = 'R022' AND f.code = 'FACT_INGRESOS_MIN_3_SMMLV' THEN 1
        WHEN r.code = 'R022' AND f.code = 'FACT_ANTIGUEDAD_LABORAL_12_MESES' THEN 2
        WHEN r.code = 'R023' AND f.code = 'FACT_PERFIL_RIESGO_BAJO' THEN 0
        WHEN r.code = 'R023' AND f.code = 'FACT_INGRESOS_MIN_2_SMMLV' THEN 1
        WHEN r.code = 'R030' AND f.code = 'FACT_PERFIL_RIESGO_MEDIO' THEN 0
        WHEN r.code = 'R030' AND f.code = 'FACT_FINALIDAD_VEHICULO' THEN 1
        WHEN r.code = 'R030' AND f.code = 'FACT_INGRESOS_MIN_4_SMMLV' THEN 2
        WHEN r.code = 'R030' AND f.code = 'FACT_PORCENTAJE_INICIAL_30' THEN 3
        WHEN r.code = 'R031' AND f.code = 'FACT_PERFIL_RIESGO_MEDIO' THEN 0
        WHEN r.code = 'R031' AND f.code = 'FACT_INGRESOS_MIN_2_SMMLV' THEN 1
        WHEN r.code = 'R031' AND f.code = 'FACT_CODEUDOR_DISPONIBLE' THEN 2
        WHEN r.code = 'R031' AND f.code = 'FACT_INGRESOS_CODEUDOR_2_SMMLV' THEN 3
        WHEN r.code = 'R032' AND f.code = 'FACT_PERFIL_RIESGO_MEDIO' THEN 0
        WHEN r.code = 'R032' AND f.code = 'FACT_INGRESOS_MIN_1_SMMLV' THEN 1
        WHEN r.code = 'R032' AND f.code = 'FACT_ACTIVIDAD_MICROEMPRESARIAL' THEN 2
        WHEN r.code = 'R033' AND f.code = 'FACT_PERFIL_RIESGO_ALTO' THEN 0
        WHEN r.code = 'R033' AND f.code = 'FACT_FINALIDAD_VEHICULO' THEN 1
        WHEN r.code = 'R033' AND f.code = 'FACT_INGRESOS_MIN_5_SMMLV' THEN 2
        WHEN r.code = 'R033' AND f.code = 'FACT_ENGANCHE_MIN_50' THEN 3
        WHEN r.code = 'R034' AND f.code = 'FACT_PERFIL_RIESGO_ALTO' THEN 0
        WHEN r.code = 'R034' AND f.code = 'FACT_INGRESOS_MIN_2_SMMLV' THEN 1
        WHEN r.code = 'R034' AND f.code = 'FACT_ACTIVIDAD_MICROEMPRESARIAL' THEN 2
        WHEN r.code = 'R035' AND f.code = 'FACT_PERFIL_RIESGO_ALTO' THEN 0
        WHEN r.code = 'R035' AND f.code = 'FACT_INGRESOS_MIN_3_SMMLV' THEN 1
        WHEN r.code = 'R035' AND f.code = 'FACT_ANTIGUEDAD_LABORAL_24_MESES' THEN 2
        WHEN r.code = 'R040' AND f.code = 'FACT_ACTIVIDAD_ALTO_RIESGO_SARLAFT' THEN 0
        WHEN r.code = 'R041' AND f.code = 'FACT_PERSONA_PEP' THEN 0
        WHEN r.code = 'R041' AND f.code = 'FACT_APROBACION_COMITE_PEP' THEN 1
        WHEN r.code = 'R042' AND f.code = 'FACT_MULTIPLES_CONSULTAS' THEN 0
        WHEN r.code = 'R043' AND f.code = 'FACT_DOCUMENTOS_COMPLETOS' THEN 0
        WHEN r.code = 'R043' AND f.code = 'FACT_DOCUMENTOS_VALIDOS' THEN 1
        WHEN r.code = 'R044' AND f.code = 'FACT_REFERENCIAS_VERIFICADAS' THEN 0
        WHEN r.code = 'R044' AND f.code = 'FACT_REFERENCIAS_POSITIVAS' THEN 1
        WHEN r.code = 'R045' AND f.code = 'FACT_GARANTIAS_SUFICIENTES' THEN 0
        WHEN r.code = 'R045' AND f.code = 'FACT_GARANTIAS_AVALUADAS' THEN 1
        WHEN r.code = 'R046' AND f.code = 'FACT_HISTORIAL_CREDITICIO_POSITIVO' THEN 0
        WHEN r.code = 'R046' AND f.code = 'FACT_CUMPLIMIENTO_PAGOS' THEN 1
        WHEN r.code = 'R047' AND f.code = 'FACT_CAPACIDAD_PAGO_DEMOSTRADA' THEN 0
        WHEN r.code = 'R047' AND f.code = 'FACT_MARGEN_PAGO_SUFICIENTE' THEN 1
        WHEN r.code = 'R048' AND f.code = 'FACT_ESTABILIDAD_LABORAL' THEN 0
        WHEN r.code = 'R048' AND f.code = 'FACT_ANTIGUEDAD_LABORAL_MINIMA' THEN 1
        WHEN r.code = 'R050' AND f.code = 'FACT_ANTIGUEDAD_CLIENTE_24_MESES' THEN 0
        WHEN r.code = 'R050' AND f.code = 'FACT_CUMPLIMIENTO_HISTORICO_95' THEN 1
        WHEN r.code = 'R051' AND f.code = 'FACT_EMPLEADO_EMPRESA_CONVENIO' THEN 0
        WHEN r.code = 'R051' AND f.code = 'FACT_DESCUENTO_NOMINA_AUTORIZADO' THEN 1
        WHEN r.code = 'R052' AND f.code = 'FACT_TIPO_VINCULACION_PENSIONADO' THEN 0
        WHEN r.code = 'R052' AND f.code = 'FACT_MESADA_PENSION_2_SMMLV' THEN 1
        WHEN r.code = 'R052' AND f.code = 'FACT_PENSION_LEGAL' THEN 2
        WHEN r.code = 'R060' AND f.code = 'FACT_DECISION_TOMADA' THEN 0
        WHEN r.code = 'R061' AND f.code = 'FACT_EVALUACION_COMPLETADA' THEN 0
        ELSE 0
    END
FROM sys.rules r
CROSS JOIN sys.facts f
WHERE (
    (r.code = 'R001' AND f.code = 'FACT_EDAD_18_75') OR
    (r.code = 'R002' AND f.code = 'FACT_INGRESOS_MIN_1_SMMLV') OR
    (r.code = 'R003' AND f.code = 'FACT_SCORE_MIN_300') OR
    (r.code = 'R004' AND f.code = 'FACT_ENDEUDAMIENTO_MAX_50') OR
    (r.code = 'R005' AND f.code = 'FACT_MORA_MAX_90_DIAS') OR
    (r.code = 'R010' AND f.code IN ('FACT_SCORE_700_PLUS', 'FACT_MORA_MAX_30_DIAS')) OR
    (r.code = 'R011' AND f.code IN ('FACT_SCORE_500_699', 'FACT_MORA_MAX_60_DIAS')) OR
    (r.code = 'R012' AND f.code = 'FACT_SCORE_300_499') OR
    (r.code = 'R020' AND f.code IN ('FACT_PERFIL_RIESGO_BAJO', 'FACT_FINALIDAD_VIVIENDA', 'FACT_INGRESOS_MIN_4_SMMLV', 'FACT_CUOTA_MAX_30_INGRESOS')) OR
    (r.code = 'R021' AND f.code IN ('FACT_PERFIL_RIESGO_BAJO', 'FACT_FINALIDAD_VEHICULO', 'FACT_INGRESOS_MIN_3_SMMLV', 'FACT_CUOTA_MAX_40_INGRESOS')) OR
    (r.code = 'R022' AND f.code IN ('FACT_PERFIL_RIESGO_BAJO', 'FACT_INGRESOS_MIN_3_SMMLV', 'FACT_ANTIGUEDAD_LABORAL_12_MESES')) OR
    (r.code = 'R023' AND f.code IN ('FACT_PERFIL_RIESGO_BAJO', 'FACT_INGRESOS_MIN_2_SMMLV')) OR
    (r.code = 'R030' AND f.code IN ('FACT_PERFIL_RIESGO_MEDIO', 'FACT_FINALIDAD_VEHICULO', 'FACT_INGRESOS_MIN_4_SMMLV', 'FACT_PORCENTAJE_INICIAL_30')) OR
    (r.code = 'R031' AND f.code IN ('FACT_PERFIL_RIESGO_MEDIO', 'FACT_INGRESOS_MIN_2_SMMLV', 'FACT_CODEUDOR_DISPONIBLE', 'FACT_INGRESOS_CODEUDOR_2_SMMLV')) OR
    (r.code = 'R032' AND f.code IN ('FACT_PERFIL_RIESGO_MEDIO', 'FACT_INGRESOS_MIN_1_SMMLV', 'FACT_ACTIVIDAD_MICROEMPRESARIAL')) OR
    (r.code = 'R033' AND f.code IN ('FACT_PERFIL_RIESGO_ALTO', 'FACT_FINALIDAD_VEHICULO', 'FACT_INGRESOS_MIN_5_SMMLV', 'FACT_ENGANCHE_MIN_50')) OR
    (r.code = 'R034' AND f.code IN ('FACT_PERFIL_RIESGO_ALTO', 'FACT_INGRESOS_MIN_2_SMMLV', 'FACT_ACTIVIDAD_MICROEMPRESARIAL')) OR
    (r.code = 'R035' AND f.code IN ('FACT_PERFIL_RIESGO_ALTO', 'FACT_INGRESOS_MIN_3_SMMLV', 'FACT_ANTIGUEDAD_LABORAL_24_MESES')) OR
    (r.code = 'R040' AND f.code = 'FACT_ACTIVIDAD_ALTO_RIESGO_SARLAFT') OR
    (r.code = 'R041' AND f.code IN ('FACT_PERSONA_PEP', 'FACT_APROBACION_COMITE_PEP')) OR
    (r.code = 'R042' AND f.code = 'FACT_MULTIPLES_CONSULTAS') OR
    (r.code = 'R043' AND f.code IN ('FACT_DOCUMENTOS_COMPLETOS', 'FACT_DOCUMENTOS_VALIDOS')) OR
    (r.code = 'R044' AND f.code IN ('FACT_REFERENCIAS_VERIFICADAS', 'FACT_REFERENCIAS_POSITIVAS')) OR
    (r.code = 'R045' AND f.code IN ('FACT_GARANTIAS_SUFICIENTES', 'FACT_GARANTIAS_AVALUADAS')) OR
    (r.code = 'R046' AND f.code IN ('FACT_HISTORIAL_CREDITICIO_POSITIVO', 'FACT_CUMPLIMIENTO_PAGOS')) OR
    (r.code = 'R047' AND f.code IN ('FACT_CAPACIDAD_PAGO_DEMOSTRADA', 'FACT_MARGEN_PAGO_SUFICIENTE')) OR
    (r.code = 'R048' AND f.code IN ('FACT_ESTABILIDAD_LABORAL', 'FACT_ANTIGUEDAD_LABORAL_MINIMA')) OR
    (r.code = 'R050' AND f.code IN ('FACT_ANTIGUEDAD_CLIENTE_24_MESES', 'FACT_CUMPLIMIENTO_HISTORICO_95')) OR
    (r.code = 'R051' AND f.code IN ('FACT_EMPLEADO_EMPRESA_CONVENIO', 'FACT_DESCUENTO_NOMINA_AUTORIZADO')) OR
    (r.code = 'R052' AND f.code IN ('FACT_TIPO_VINCULACION_PENSIONADO', 'FACT_MESADA_PENSION_2_SMMLV', 'FACT_PENSION_LEGAL')) OR
    (r.code = 'R060' AND f.code = 'FACT_DECISION_TOMADA') OR
    (r.code = 'R061' AND f.code = 'FACT_EVALUACION_COMPLETADA')
)
ON CONFLICT (rule_id, fact_id) DO NOTHING;

INSERT INTO sys.product_templates (product_code, product_name, description, base_max_amount_multiplier, base_max_amount_fixed, max_term_months, base_interest_rate, interest_rate_risk_low, interest_rate_risk_medium, interest_rate_risk_high, special_conditions, base_confidence, is_active) VALUES
('CREDITO_HIPOTECARIO', 'Crédito Hipotecario', 'Crédito para adquisición de vivienda', 15.0, 200000000, 240, NULL, 1.2, 1.5, 2.0, '["Requiere enganche mínimo del 20%", "Seguro de vida obligatorio"]'::jsonb, 95, TRUE),
('CREDITO_VEHICULO', 'Crédito Vehículo', 'Crédito para adquisición de vehículo', 10.0, 80000000, 60, NULL, 1.0, 1.2, 1.8, '["Seguro vehicular obligatorio", "Hipoteca sobre el vehículo"]'::jsonb, 90, TRUE),
('CREDITO_VEHICULO_CONDICIONADO', 'Crédito Vehículo Condicionado', 'Crédito vehicular con condiciones especiales', 8.0, 60000000, 48, 1.5, NULL, NULL, NULL, '["Requiere enganche del 30%", "Seguro de desempleo obligatorio"]'::jsonb, 85, TRUE),
('CREDITO_LIBRE_INVERSION', 'Crédito Libre Inversión', 'Crédito de libre inversión para gastos personales', 15.0, 50000000, 60, NULL, 1.8, 2.2, 2.8, '["Antigüedad laboral mínima 12 meses"]'::jsonb, 88, TRUE),
('CREDITO_CON_CODEUDOR', 'Crédito con Codeudor', 'Crédito con codeudor solidario', 12.0, 30000000, 48, 2.0, NULL, NULL, NULL, '["Codeudor con ingresos mínimos 2 SMMLV", "Evaluación conjunta obligatoria"]'::jsonb, 80, TRUE),
('MICROCREDITO', 'Microcrédito', 'Crédito para microempresarios', NULL, 25000000, 36, 2.5, NULL, NULL, NULL, '["Actividad microempresarial comprobada", "Capacitación financiera obligatoria"]'::jsonb, 75, TRUE),
('TARJETA_CREDITO', 'Tarjeta de Crédito', 'Tarjeta de crédito con cupo aprobado', 3.0, 15000000, 0, 2.8, NULL, NULL, NULL, '["Cupo inicial según perfil", "Seguro de protección de compras"]'::jsonb, 92, TRUE),
('CREDITO_NOMINA', 'Crédito de Nómina', 'Crédito con descuento por nómina', 8.0, 40000000, 36, 1.5, NULL, NULL, NULL, '["Descuento automático por nómina", "Tasa preferencial"]'::jsonb, 95, TRUE),
('CREDITO_PENSIONADOS', 'Crédito para Pensionados', 'Crédito especial para pensionados', 6.0, 20000000, 72, 1.8, NULL, NULL, NULL, '["Descuento máximo 30% de mesada", "Pensión legal comprobada"]'::jsonb, 90, TRUE)
ON CONFLICT (product_code) DO UPDATE SET
    product_name = EXCLUDED.product_name,
    description = EXCLUDED.description,
    base_max_amount_multiplier = EXCLUDED.base_max_amount_multiplier,
    base_max_amount_fixed = EXCLUDED.base_max_amount_fixed,
    max_term_months = EXCLUDED.max_term_months,
    base_interest_rate = EXCLUDED.base_interest_rate,
    interest_rate_risk_low = EXCLUDED.interest_rate_risk_low,
    interest_rate_risk_medium = EXCLUDED.interest_rate_risk_medium,
    interest_rate_risk_high = EXCLUDED.interest_rate_risk_high,
    special_conditions = EXCLUDED.special_conditions,
    base_confidence = EXCLUDED.base_confidence,
    is_active = EXCLUDED.is_active;

COMMIT;

