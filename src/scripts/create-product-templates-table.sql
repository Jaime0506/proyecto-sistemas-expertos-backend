BEGIN;

CREATE TABLE IF NOT EXISTS sys.product_templates (
    id SERIAL PRIMARY KEY,
    product_code VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    description TEXT,
    base_max_amount_multiplier DECIMAL(10,2),
    base_max_amount_fixed DECIMAL(15,2),
    max_term_months INTEGER,
    base_interest_rate DECIMAL(5,2),
    interest_rate_risk_low DECIMAL(5,2),
    interest_rate_risk_medium DECIMAL(5,2),
    interest_rate_risk_high DECIMAL(5,2),
    special_conditions JSONB,
    base_confidence DECIMAL(5,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER,
    updated_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_product_templates_created_by FOREIGN KEY (created_by) REFERENCES sys.expertos(id) ON DELETE SET NULL,
    CONSTRAINT fk_product_templates_updated_by FOREIGN KEY (updated_by) REFERENCES sys.expertos(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_product_templates_product_code ON sys.product_templates(product_code);
CREATE INDEX IF NOT EXISTS idx_product_templates_is_active ON sys.product_templates(is_active);

COMMIT;

