-- Script para crear las tablas del motor de inferencia
-- Ejecutar después de poblar facts, failures y facts_failures

-- Tabla para sesiones de evaluación
CREATE TABLE IF NOT EXISTS sys.evaluation_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL UNIQUE,
    user_id INTEGER,
    input_data JSONB NOT NULL,
    facts_detected JSONB,
    evaluation_result JSONB,
    final_decision VARCHAR(50),
    risk_profile VARCHAR(50),
    recommended_products JSONB,
    explanation TEXT,
    confidence_score DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'PENDING' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabla para ejecuciones de reglas
CREATE TABLE IF NOT EXISTS sys.rule_executions (
    id SERIAL PRIMARY KEY,
    evaluation_session_id INTEGER NOT NULL,
    rule_code VARCHAR(10) NOT NULL,
    rule_name VARCHAR(100) NOT NULL,
    rule_category VARCHAR(50) NOT NULL,
    rule_conditions JSONB,
    rule_facts_used JSONB,
    rule_applied BOOLEAN NOT NULL,
    result VARCHAR(20) NOT NULL,
    failure_detected TEXT,
    explanation TEXT,
    execution_time_ms DECIMAL(5,2),
    priority INTEGER,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (evaluation_session_id) REFERENCES sys.evaluation_sessions(id) ON DELETE CASCADE
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_evaluation_sessions_user_id ON sys.evaluation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_sessions_session_id ON sys.evaluation_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_sessions_status ON sys.evaluation_sessions(status);
CREATE INDEX IF NOT EXISTS idx_evaluation_sessions_created_at ON sys.evaluation_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_rule_executions_session_id ON sys.rule_executions(evaluation_session_id);
CREATE INDEX IF NOT EXISTS idx_rule_executions_rule_code ON sys.rule_executions(rule_code);
CREATE INDEX IF NOT EXISTS idx_rule_executions_result ON sys.rule_executions(result);
CREATE INDEX IF NOT EXISTS idx_rule_executions_executed_at ON sys.rule_executions(executed_at);

-- Comentarios en las tablas
COMMENT ON TABLE sys.evaluation_sessions IS 'Sesiones de evaluación del sistema experto';
COMMENT ON TABLE sys.rule_executions IS 'Ejecuciones de reglas del motor de inferencia';

COMMENT ON COLUMN sys.evaluation_sessions.session_id IS 'Identificador único de la sesión de evaluación';
COMMENT ON COLUMN sys.evaluation_sessions.input_data IS 'Datos de entrada del usuario (respuestas del survey)';
COMMENT ON COLUMN sys.evaluation_sessions.facts_detected IS 'Facts detectados basados en los datos de entrada';
COMMENT ON COLUMN sys.evaluation_sessions.evaluation_result IS 'Resultado completo de la evaluación';
COMMENT ON COLUMN sys.evaluation_sessions.final_decision IS 'Decisión final: APROBADO, RECHAZADO, CONDICIONADO, PENDIENTE';
COMMENT ON COLUMN sys.evaluation_sessions.risk_profile IS 'Perfil de riesgo: BAJO, MEDIO, ALTO';
COMMENT ON COLUMN sys.evaluation_sessions.recommended_products IS 'Productos recomendados con detalles';
COMMENT ON COLUMN sys.evaluation_sessions.explanation IS 'Explicación detallada de la decisión';
COMMENT ON COLUMN sys.evaluation_sessions.confidence_score IS 'Nivel de confianza de la evaluación (0-100)';
COMMENT ON COLUMN sys.evaluation_sessions.status IS 'Estado de la sesión: PENDING, COMPLETED, FAILED';

COMMENT ON COLUMN sys.rule_executions.rule_code IS 'Código de la regla (R001, R002, etc.)';
COMMENT ON COLUMN sys.rule_executions.rule_name IS 'Nombre descriptivo de la regla';
COMMENT ON COLUMN sys.rule_executions.rule_category IS 'Categoría: ADMISIBILIDAD, RIESGO, PRODUCTO, NORMATIVA, ESPECIAL';
COMMENT ON COLUMN sys.rule_executions.rule_conditions IS 'Condiciones evaluadas en la regla';
COMMENT ON COLUMN sys.rule_executions.rule_facts_used IS 'Facts utilizados en la evaluación';
COMMENT ON COLUMN sys.rule_executions.rule_applied IS 'Si la regla se aplicó o no';
COMMENT ON COLUMN sys.rule_executions.result IS 'Resultado: PASS, FAIL, NOT_APPLICABLE';
COMMENT ON COLUMN sys.rule_executions.failure_detected IS 'Failure detectado si aplica';
COMMENT ON COLUMN sys.rule_executions.explanation IS 'Explicación del resultado';
COMMENT ON COLUMN sys.rule_executions.execution_time_ms IS 'Tiempo de ejecución en milisegundos';
COMMENT ON COLUMN sys.rule_executions.priority IS 'Prioridad de la regla para orden de ejecución';

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_evaluation_sessions_updated_at 
    BEFORE UPDATE ON sys.evaluation_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verificar que las tablas se crearon correctamente
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'sys' 
    AND table_name IN ('evaluation_sessions', 'rule_executions')
ORDER BY table_name;
