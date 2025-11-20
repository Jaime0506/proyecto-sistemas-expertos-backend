BEGIN;

ALTER TABLE sys.rules ADD COLUMN IF NOT EXISTS code VARCHAR(10);
ALTER TABLE sys.rules ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE sys.rules ADD COLUMN IF NOT EXISTS priority INTEGER;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'sys' AND table_name = 'rules' AND column_name = 'code') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'rules_code_key') THEN
            ALTER TABLE sys.rules ADD CONSTRAINT rules_code_key UNIQUE (code);
        END IF;
    END IF;
END $$;

ALTER TABLE sys.rule_executions ADD COLUMN IF NOT EXISTS rule_id INTEGER;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'sys' AND table_name = 'rule_executions' AND column_name = 'rule_code') THEN
        EXECUTE '
            UPDATE sys.rule_executions re
            SET rule_id = r.id
            FROM sys.rules r
            WHERE r.code = re.rule_code AND re.rule_id IS NULL
        ';
    END IF;
END $$;

ALTER TABLE sys.evaluation_sessions ADD COLUMN IF NOT EXISTS cliente_id INTEGER;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'user_type_enum' AND n.nspname = 'sys') THEN
        CREATE TYPE sys.user_type_enum AS ENUM ('experto', 'administrador', 'cliente');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE sys.refresh_tokens ADD COLUMN IF NOT EXISTS user_type sys.user_type_enum;

UPDATE sys.refresh_tokens rt
SET user_type = CASE
    WHEN EXISTS (SELECT 1 FROM sys.expertos e WHERE e.id = rt.user_id) THEN 'experto'::sys.user_type_enum
    WHEN EXISTS (SELECT 1 FROM sys.administradores a WHERE a.id = rt.user_id) THEN 'administrador'::sys.user_type_enum
    WHEN EXISTS (SELECT 1 FROM sys.clientes c WHERE c.id = rt.user_id) THEN 'cliente'::sys.user_type_enum
    ELSE 'experto'::sys.user_type_enum
END
WHERE user_type IS NULL;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'sys' AND table_name = 'refresh_tokens' AND column_name = 'user_type') THEN
        ALTER TABLE sys.refresh_tokens ALTER COLUMN user_type SET NOT NULL;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_evaluation_sessions_cliente') THEN
        ALTER TABLE sys.evaluation_sessions ADD CONSTRAINT fk_evaluation_sessions_cliente FOREIGN KEY (cliente_id) REFERENCES sys.clientes(id) ON DELETE SET NULL;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_rule_executions_rule') THEN
        ALTER TABLE sys.rule_executions ADD CONSTRAINT fk_rule_executions_rule FOREIGN KEY (rule_id) REFERENCES sys.rules(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_rules_failure') THEN
        ALTER TABLE sys.rules ADD CONSTRAINT fk_rules_failure FOREIGN KEY (failure_id) REFERENCES sys.failures(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_rule_facts_rule') THEN
        ALTER TABLE sys.rule_facts ADD CONSTRAINT fk_rule_facts_rule FOREIGN KEY (rule_id) REFERENCES sys.rules(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_rule_facts_fact') THEN
        ALTER TABLE sys.rule_facts ADD CONSTRAINT fk_rule_facts_fact FOREIGN KEY (fact_id) REFERENCES sys.facts(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_facts_failures_fact') THEN
        ALTER TABLE sys.facts_failures ADD CONSTRAINT fk_facts_failures_fact FOREIGN KEY (fact_id) REFERENCES sys.facts(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_facts_failures_failure') THEN
        ALTER TABLE sys.facts_failures ADD CONSTRAINT fk_facts_failures_failure FOREIGN KEY (failure_id) REFERENCES sys.failures(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_roles_permissions_role') THEN
        ALTER TABLE sys.roles_permissions ADD CONSTRAINT fk_roles_permissions_role FOREIGN KEY (role_id) REFERENCES sys.roles(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_roles_permissions_permission') THEN
        ALTER TABLE sys.roles_permissions ADD CONSTRAINT fk_roles_permissions_permission FOREIGN KEY (permission_id) REFERENCES sys.permissions(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_expertos_roles_experto') THEN
        ALTER TABLE sys.expertos_roles ADD CONSTRAINT fk_expertos_roles_experto FOREIGN KEY (experto_id) REFERENCES sys.expertos(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_expertos_roles_role') THEN
        ALTER TABLE sys.expertos_roles ADD CONSTRAINT fk_expertos_roles_role FOREIGN KEY (role_id) REFERENCES sys.roles(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_administradores_roles_administrador') THEN
        ALTER TABLE sys.administradores_roles ADD CONSTRAINT fk_administradores_roles_administrador FOREIGN KEY (administrador_id) REFERENCES sys.administradores(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_administradores_roles_role') THEN
        ALTER TABLE sys.administradores_roles ADD CONSTRAINT fk_administradores_roles_role FOREIGN KEY (role_id) REFERENCES sys.roles(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE OR REPLACE FUNCTION sys.validate_refresh_token_user()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_type = 'experto' THEN
        IF NOT EXISTS (SELECT 1 FROM sys.expertos WHERE id = NEW.user_id) THEN
            RAISE EXCEPTION 'user_id % does not exist in expertos table', NEW.user_id;
        END IF;
    ELSIF NEW.user_type = 'administrador' THEN
        IF NOT EXISTS (SELECT 1 FROM sys.administradores WHERE id = NEW.user_id) THEN
            RAISE EXCEPTION 'user_id % does not exist in administradores table', NEW.user_id;
        END IF;
    ELSIF NEW.user_type = 'cliente' THEN
        IF NOT EXISTS (SELECT 1 FROM sys.clientes WHERE id = NEW.user_id) THEN
            RAISE EXCEPTION 'user_id % does not exist in clientes table', NEW.user_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validate_refresh_token_user ON sys.refresh_tokens;

CREATE TRIGGER trigger_validate_refresh_token_user
    BEFORE INSERT OR UPDATE ON sys.refresh_tokens
    FOR EACH ROW
    EXECUTE FUNCTION sys.validate_refresh_token_user();

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_type_user_id ON sys.refresh_tokens(user_type, user_id);
CREATE INDEX IF NOT EXISTS idx_expertos_email ON sys.expertos(email);
CREATE INDEX IF NOT EXISTS idx_expertos_username ON sys.expertos(username);
CREATE INDEX IF NOT EXISTS idx_administradores_email ON sys.administradores(email);
CREATE INDEX IF NOT EXISTS idx_administradores_username ON sys.administradores(username);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON sys.clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_username ON sys.clientes(username);
CREATE INDEX IF NOT EXISTS idx_evaluation_sessions_cliente_id ON sys.evaluation_sessions(cliente_id);
CREATE INDEX IF NOT EXISTS idx_rule_executions_rule_id ON sys.rule_executions(rule_id);
CREATE INDEX IF NOT EXISTS idx_rule_executions_evaluation_session_id ON sys.rule_executions(evaluation_session_id);
CREATE INDEX IF NOT EXISTS idx_rules_code ON sys.rules(code);
CREATE INDEX IF NOT EXISTS idx_rules_failure_id ON sys.rules(failure_id);
CREATE INDEX IF NOT EXISTS idx_rule_facts_rule_id ON sys.rule_facts(rule_id);
CREATE INDEX IF NOT EXISTS idx_rule_facts_fact_id ON sys.rule_facts(fact_id);
CREATE INDEX IF NOT EXISTS idx_facts_failures_fact_id ON sys.facts_failures(fact_id);
CREATE INDEX IF NOT EXISTS idx_facts_failures_failure_id ON sys.facts_failures(failure_id);
CREATE INDEX IF NOT EXISTS idx_expertos_roles_experto_id ON sys.expertos_roles(experto_id);
CREATE INDEX IF NOT EXISTS idx_expertos_roles_role_id ON sys.expertos_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_administradores_roles_administrador_id ON sys.administradores_roles(administrador_id);
CREATE INDEX IF NOT EXISTS idx_administradores_roles_role_id ON sys.administradores_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_roles_permissions_role_id ON sys.roles_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_roles_permissions_permission_id ON sys.roles_permissions(permission_id);

ALTER TABLE sys.rules ADD COLUMN IF NOT EXISTS created_by INTEGER;
ALTER TABLE sys.rules ADD COLUMN IF NOT EXISTS updated_by INTEGER;
ALTER TABLE sys.facts ADD COLUMN IF NOT EXISTS created_by INTEGER;
ALTER TABLE sys.facts ADD COLUMN IF NOT EXISTS updated_by INTEGER;
ALTER TABLE sys.failures ADD COLUMN IF NOT EXISTS created_by INTEGER;
ALTER TABLE sys.failures ADD COLUMN IF NOT EXISTS updated_by INTEGER;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_rules_created_by_experto') THEN
        ALTER TABLE sys.rules ADD CONSTRAINT fk_rules_created_by_experto FOREIGN KEY (created_by) REFERENCES sys.expertos(id) ON DELETE SET NULL;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_rules_updated_by_experto') THEN
        ALTER TABLE sys.rules ADD CONSTRAINT fk_rules_updated_by_experto FOREIGN KEY (updated_by) REFERENCES sys.expertos(id) ON DELETE SET NULL;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_facts_created_by_experto') THEN
        ALTER TABLE sys.facts ADD CONSTRAINT fk_facts_created_by_experto FOREIGN KEY (created_by) REFERENCES sys.expertos(id) ON DELETE SET NULL;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_facts_updated_by_experto') THEN
        ALTER TABLE sys.facts ADD CONSTRAINT fk_facts_updated_by_experto FOREIGN KEY (updated_by) REFERENCES sys.expertos(id) ON DELETE SET NULL;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_failures_created_by_experto') THEN
        ALTER TABLE sys.failures ADD CONSTRAINT fk_failures_created_by_experto FOREIGN KEY (created_by) REFERENCES sys.expertos(id) ON DELETE SET NULL;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_failures_updated_by_experto') THEN
        ALTER TABLE sys.failures ADD CONSTRAINT fk_failures_updated_by_experto FOREIGN KEY (updated_by) REFERENCES sys.expertos(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS sys.product_recommendations (
    id SERIAL PRIMARY KEY,
    evaluation_session_id INTEGER NOT NULL,
    product_code VARCHAR(50) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    description TEXT,
    max_amount DECIMAL(15,2),
    max_term_months INTEGER,
    interest_rate DECIMAL(5,2),
    special_conditions JSONB,
    confidence DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_product_recommendations_evaluation_session FOREIGN KEY (evaluation_session_id) REFERENCES sys.evaluation_sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_rules_created_by ON sys.rules(created_by);
CREATE INDEX IF NOT EXISTS idx_rules_updated_by ON sys.rules(updated_by);
CREATE INDEX IF NOT EXISTS idx_facts_created_by ON sys.facts(created_by);
CREATE INDEX IF NOT EXISTS idx_facts_updated_by ON sys.facts(updated_by);
CREATE INDEX IF NOT EXISTS idx_failures_created_by ON sys.failures(created_by);
CREATE INDEX IF NOT EXISTS idx_failures_updated_by ON sys.failures(updated_by);
CREATE INDEX IF NOT EXISTS idx_product_recommendations_evaluation_session_id ON sys.product_recommendations(evaluation_session_id);
CREATE INDEX IF NOT EXISTS idx_product_recommendations_product_code ON sys.product_recommendations(product_code);

DROP TABLE IF EXISTS sys.options_fact CASCADE;
DROP TABLE IF EXISTS sys.options CASCADE;
DROP TABLE IF EXISTS sys.questions CASCADE;

COMMIT;
