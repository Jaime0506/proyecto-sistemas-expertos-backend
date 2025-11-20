BEGIN;

CREATE TABLE IF NOT EXISTS sys.evaluation_input_data (
    id SERIAL PRIMARY KEY,
    evaluation_session_id INTEGER NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    field_value TEXT,
    field_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_evaluation_input_data_session FOREIGN KEY (evaluation_session_id) REFERENCES sys.evaluation_sessions(id) ON DELETE CASCADE,
    UNIQUE(evaluation_session_id, field_name)
);

CREATE TABLE IF NOT EXISTS sys.evaluation_facts_detected (
    id SERIAL PRIMARY KEY,
    evaluation_session_id INTEGER NOT NULL,
    fact_code VARCHAR(100) NOT NULL,
    fact_id INTEGER,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_evaluation_facts_detected_session FOREIGN KEY (evaluation_session_id) REFERENCES sys.evaluation_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_evaluation_facts_detected_fact FOREIGN KEY (fact_id) REFERENCES sys.facts(id) ON DELETE SET NULL,
    UNIQUE(evaluation_session_id, fact_code)
);

CREATE TABLE IF NOT EXISTS sys.evaluation_results (
    id SERIAL PRIMARY KEY,
    evaluation_session_id INTEGER NOT NULL UNIQUE,
    facts_count INTEGER,
    rule_executions_count INTEGER,
    failures_count INTEGER,
    recommended_products_count INTEGER,
    special_conditions_count INTEGER,
    risk_profile VARCHAR(50),
    confidence_base DECIMAL(5,2),
    confidence_failures_penalty DECIMAL(5,2),
    confidence_failed_rules_penalty DECIMAL(5,2),
    confidence_positive_facts_bonus DECIMAL(5,2),
    confidence_successful_rules_bonus DECIMAL(5,2),
    execution_conversion_time_ms DECIMAL(10,2),
    execution_forward_chaining_time_ms DECIMAL(10,2),
    execution_total_time_ms DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_evaluation_results_session FOREIGN KEY (evaluation_session_id) REFERENCES sys.evaluation_sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sys.evaluation_result_failures (
    id SERIAL PRIMARY KEY,
    evaluation_result_id INTEGER NOT NULL,
    failure_code VARCHAR(100) NOT NULL,
    failure_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_evaluation_result_failures_result FOREIGN KEY (evaluation_result_id) REFERENCES sys.evaluation_results(id) ON DELETE CASCADE,
    CONSTRAINT fk_evaluation_result_failures_failure FOREIGN KEY (failure_id) REFERENCES sys.failures(id) ON DELETE SET NULL,
    UNIQUE(evaluation_result_id, failure_code)
);

CREATE TABLE IF NOT EXISTS sys.evaluation_result_special_conditions (
    id SERIAL PRIMARY KEY,
    evaluation_result_id INTEGER NOT NULL,
    condition_code VARCHAR(100) NOT NULL,
    condition_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_evaluation_result_special_conditions_result FOREIGN KEY (evaluation_result_id) REFERENCES sys.evaluation_results(id) ON DELETE CASCADE,
    UNIQUE(evaluation_result_id, condition_code)
);

CREATE TABLE IF NOT EXISTS sys.rule_execution_conditions (
    id SERIAL PRIMARY KEY,
    rule_execution_id INTEGER NOT NULL,
    condition_key VARCHAR(100) NOT NULL,
    condition_value TEXT,
    condition_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_rule_execution_conditions_execution FOREIGN KEY (rule_execution_id) REFERENCES sys.rule_executions(id) ON DELETE CASCADE,
    UNIQUE(rule_execution_id, condition_key)
);

CREATE TABLE IF NOT EXISTS sys.rule_execution_facts_used (
    id SERIAL PRIMARY KEY,
    rule_execution_id INTEGER NOT NULL,
    fact_code VARCHAR(100) NOT NULL,
    fact_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_rule_execution_facts_used_execution FOREIGN KEY (rule_execution_id) REFERENCES sys.rule_executions(id) ON DELETE CASCADE,
    CONSTRAINT fk_rule_execution_facts_used_fact FOREIGN KEY (fact_id) REFERENCES sys.facts(id) ON DELETE SET NULL,
    UNIQUE(rule_execution_id, fact_code)
);

DO $$ 
DECLARE
    session_record RECORD;
    v_input_key TEXT;
    v_input_value TEXT;
    v_fact_code TEXT;
    result_record RECORD;
    v_failure_code TEXT;
    v_condition_code TEXT;
    exec_record RECORD;
    v_cond_key TEXT;
    v_cond_value TEXT;
BEGIN
    FOR session_record IN SELECT id, input_data, facts_detected, evaluation_result, recommended_products FROM sys.evaluation_sessions WHERE input_data IS NOT NULL
    LOOP
        FOR v_input_key, v_input_value IN SELECT * FROM jsonb_each_text(session_record.input_data)
        LOOP
            INSERT INTO sys.evaluation_input_data (evaluation_session_id, field_name, field_value, field_type)
            VALUES (session_record.id, v_input_key, v_input_value, 
                CASE 
                    WHEN v_input_value ~ '^-?[0-9]+$' THEN 'integer'
                    WHEN v_input_value ~ '^-?[0-9]+\.[0-9]+$' THEN 'decimal'
                    WHEN v_input_value IN ('true', 'false') THEN 'boolean'
                    ELSE 'string'
                END)
            ON CONFLICT (evaluation_session_id, field_name) DO NOTHING;
        END LOOP;

        IF session_record.facts_detected IS NOT NULL THEN
            FOR v_fact_code IN SELECT jsonb_array_elements_text(session_record.facts_detected)
            LOOP
                INSERT INTO sys.evaluation_facts_detected (evaluation_session_id, fact_code, fact_id)
                SELECT session_record.id, v_fact_code, f.id
                FROM sys.facts f
                WHERE f.code = v_fact_code
                ON CONFLICT (evaluation_session_id, fact_code) DO UPDATE SET fact_id = EXCLUDED.fact_id;
            END LOOP;
        END IF;

        IF session_record.evaluation_result IS NOT NULL THEN
            INSERT INTO sys.evaluation_results (
                evaluation_session_id,
                facts_count,
                rule_executions_count,
                failures_count,
                recommended_products_count,
                special_conditions_count,
                risk_profile,
                confidence_base,
                confidence_failures_penalty,
                confidence_failed_rules_penalty,
                confidence_positive_facts_bonus,
                confidence_successful_rules_bonus,
                execution_conversion_time_ms,
                execution_forward_chaining_time_ms,
                execution_total_time_ms
            )
            VALUES (
                session_record.id,
                (session_record.evaluation_result->>'facts_count')::INTEGER,
                (session_record.evaluation_result->>'rule_executions_count')::INTEGER,
                (session_record.evaluation_result->>'failures_count')::INTEGER,
                (session_record.evaluation_result->>'recommended_products_count')::INTEGER,
                (session_record.evaluation_result->>'special_conditions_count')::INTEGER,
                session_record.evaluation_result->>'risk_profile',
                (session_record.evaluation_result->'confidence_calculation'->>'base')::DECIMAL,
                (session_record.evaluation_result->'confidence_calculation'->>'failures_penalty')::DECIMAL,
                (session_record.evaluation_result->'confidence_calculation'->>'failed_rules_penalty')::DECIMAL,
                (session_record.evaluation_result->'confidence_calculation'->>'positive_facts_bonus')::DECIMAL,
                (session_record.evaluation_result->'confidence_calculation'->>'successful_rules_bonus')::DECIMAL,
                (session_record.evaluation_result->'execution_times'->>'conversion_time_ms')::DECIMAL,
                (session_record.evaluation_result->'execution_times'->>'forward_chaining_time_ms')::DECIMAL,
                (session_record.evaluation_result->'execution_times'->>'total_time_ms')::DECIMAL
            )
            ON CONFLICT (evaluation_session_id) DO NOTHING
            RETURNING id INTO result_record;

            IF result_record.id IS NOT NULL THEN
                IF session_record.evaluation_result->'failures' IS NOT NULL THEN
                    FOR v_failure_code IN SELECT jsonb_array_elements_text(session_record.evaluation_result->'failures')
                    LOOP
                        INSERT INTO sys.evaluation_result_failures (evaluation_result_id, failure_code, failure_id)
                        SELECT result_record.id, v_failure_code, f.id
                        FROM sys.failures f
                        WHERE f.name = v_failure_code
                        ON CONFLICT (evaluation_result_id, failure_code) DO NOTHING;
                    END LOOP;
                END IF;

                IF session_record.evaluation_result->'special_conditions' IS NOT NULL THEN
                    FOR v_condition_code IN SELECT jsonb_array_elements_text(session_record.evaluation_result->'special_conditions')
                    LOOP
                        INSERT INTO sys.evaluation_result_special_conditions (evaluation_result_id, condition_code, condition_description)
                        VALUES (result_record.id, v_condition_code, v_condition_code)
                        ON CONFLICT (evaluation_result_id, condition_code) DO NOTHING;
                    END LOOP;
                END IF;
            END IF;
        END IF;

        IF session_record.recommended_products IS NOT NULL THEN
            INSERT INTO sys.product_recommendations (
                evaluation_session_id,
                product_code,
                product_name,
                description,
                max_amount,
                max_term_months,
                interest_rate,
                special_conditions,
                confidence
            )
            SELECT 
                session_record.id,
                COALESCE(prod->>'code', 'UNKNOWN'),
                prod->>'name',
                prod->>'description',
                (prod->>'max_amount')::DECIMAL,
                (prod->>'max_term_months')::INTEGER,
                (prod->>'interest_rate')::DECIMAL,
                prod->'special_conditions',
                (prod->>'confidence')::DECIMAL
            FROM jsonb_array_elements(session_record.recommended_products) AS prod
            ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;

    FOR exec_record IN SELECT id, rule_conditions, rule_facts_used FROM sys.rule_executions WHERE rule_conditions IS NOT NULL OR rule_facts_used IS NOT NULL
    LOOP
        IF exec_record.rule_conditions IS NOT NULL THEN
            FOR v_cond_key, v_cond_value IN SELECT * FROM jsonb_each_text(exec_record.rule_conditions)
            LOOP
                INSERT INTO sys.rule_execution_conditions (rule_execution_id, condition_key, condition_value, condition_type)
                VALUES (exec_record.id, v_cond_key, v_cond_value,
                    CASE 
                        WHEN v_cond_value ~ '^-?[0-9]+$' THEN 'integer'
                        WHEN v_cond_value ~ '^-?[0-9]+\.[0-9]+$' THEN 'decimal'
                        WHEN v_cond_value IN ('true', 'false') THEN 'boolean'
                        ELSE 'string'
                    END)
                ON CONFLICT (rule_execution_id, condition_key) DO NOTHING;
            END LOOP;
        END IF;

        IF exec_record.rule_facts_used IS NOT NULL THEN
            FOR v_fact_code IN SELECT jsonb_array_elements_text(exec_record.rule_facts_used)
            LOOP
                INSERT INTO sys.rule_execution_facts_used (rule_execution_id, fact_code, fact_id)
                SELECT exec_record.id, v_fact_code, f.id
                FROM sys.facts f
                WHERE f.code = v_fact_code
                ON CONFLICT (rule_execution_id, fact_code) DO UPDATE SET fact_id = EXCLUDED.fact_id;
            END LOOP;
        END IF;
    END LOOP;
END $$;

CREATE INDEX IF NOT EXISTS idx_evaluation_input_data_session_id ON sys.evaluation_input_data(evaluation_session_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_facts_detected_session_id ON sys.evaluation_facts_detected(evaluation_session_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_facts_detected_fact_id ON sys.evaluation_facts_detected(fact_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_results_session_id ON sys.evaluation_results(evaluation_session_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_result_failures_result_id ON sys.evaluation_result_failures(evaluation_result_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_result_special_conditions_result_id ON sys.evaluation_result_special_conditions(evaluation_result_id);
CREATE INDEX IF NOT EXISTS idx_rule_execution_conditions_execution_id ON sys.rule_execution_conditions(rule_execution_id);
CREATE INDEX IF NOT EXISTS idx_rule_execution_facts_used_execution_id ON sys.rule_execution_facts_used(rule_execution_id);

COMMIT;

