BEGIN;

DROP TABLE IF EXISTS sys.evaluation_input_data CASCADE;

CREATE TABLE sys.evaluation_input_data (
    id SERIAL PRIMARY KEY,
    evaluation_session_id INTEGER NOT NULL UNIQUE,
    age INTEGER,
    monthly_income DECIMAL(15,2),
    credit_score INTEGER,
    employment_status VARCHAR(100),
    credit_purpose VARCHAR(100),
    requested_amount DECIMAL(15,2),
    debt_to_income_ratio DECIMAL(5,2),
    max_days_delinquency INTEGER,
    employment_tenure_months INTEGER,
    payment_to_income_ratio DECIMAL(5,2),
    down_payment_percentage DECIMAL(5,2),
    has_co_borrower BOOLEAN,
    co_borrower_income DECIMAL(15,2),
    is_microenterprise BOOLEAN,
    economic_activity VARCHAR(200),
    is_pep BOOLEAN,
    pep_committee_approval BOOLEAN,
    recent_inquiries INTEGER,
    customer_tenure_months INTEGER,
    historical_compliance DECIMAL(5,2),
    is_convention_employee BOOLEAN,
    payroll_discount_authorized BOOLEAN,
    employment_type VARCHAR(100),
    pension_amount DECIMAL(15,2),
    is_legal_pension BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_evaluation_input_data_session FOREIGN KEY (evaluation_session_id) REFERENCES sys.evaluation_sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_evaluation_input_data_session_id ON sys.evaluation_input_data(evaluation_session_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_input_data_age ON sys.evaluation_input_data(age);
CREATE INDEX IF NOT EXISTS idx_evaluation_input_data_credit_score ON sys.evaluation_input_data(credit_score);
CREATE INDEX IF NOT EXISTS idx_evaluation_input_data_credit_purpose ON sys.evaluation_input_data(credit_purpose);

COMMIT;

