BEGIN;

DO $$ 
DECLARE
    session_record RECORD;
    v_input_data JSONB;
BEGIN
    FOR session_record IN 
        SELECT es.id, es.input_data 
        FROM sys.evaluation_sessions es
        WHERE es.input_data IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM sys.evaluation_input_data eid WHERE eid.evaluation_session_id = es.id)
    LOOP
        v_input_data := session_record.input_data;
        
        INSERT INTO sys.evaluation_input_data (
            evaluation_session_id,
            age,
            monthly_income,
            credit_score,
            employment_status,
            credit_purpose,
            requested_amount,
            debt_to_income_ratio,
            max_days_delinquency,
            employment_tenure_months,
            payment_to_income_ratio,
            down_payment_percentage,
            has_co_borrower,
            co_borrower_income,
            is_microenterprise,
            economic_activity,
            is_pep,
            pep_committee_approval,
            recent_inquiries,
            customer_tenure_months,
            historical_compliance,
            is_convention_employee,
            payroll_discount_authorized,
            employment_type,
            pension_amount,
            is_legal_pension
        ) VALUES (
            session_record.id,
            (v_input_data->>'age')::INTEGER,
            (v_input_data->>'monthly_income')::DECIMAL,
            (v_input_data->>'credit_score')::INTEGER,
            v_input_data->>'employment_status',
            v_input_data->>'credit_purpose',
            (v_input_data->>'requested_amount')::DECIMAL,
            (v_input_data->>'debt_to_income_ratio')::DECIMAL,
            (v_input_data->>'max_days_delinquency')::INTEGER,
            (v_input_data->>'employment_tenure_months')::INTEGER,
            (v_input_data->>'payment_to_income_ratio')::DECIMAL,
            (v_input_data->>'down_payment_percentage')::DECIMAL,
            (v_input_data->>'has_co_borrower')::BOOLEAN,
            (v_input_data->>'co_borrower_income')::DECIMAL,
            (v_input_data->>'is_microenterprise')::BOOLEAN,
            v_input_data->>'economic_activity',
            (v_input_data->>'is_pep')::BOOLEAN,
            (v_input_data->>'pep_committee_approval')::BOOLEAN,
            (v_input_data->>'recent_inquiries')::INTEGER,
            (v_input_data->>'customer_tenure_months')::INTEGER,
            (v_input_data->>'historical_compliance')::DECIMAL,
            (v_input_data->>'is_convention_employee')::BOOLEAN,
            (v_input_data->>'payroll_discount_authorized')::BOOLEAN,
            v_input_data->>'employment_type',
            (v_input_data->>'pension_amount')::DECIMAL,
            (v_input_data->>'is_legal_pension')::BOOLEAN
        )
        ON CONFLICT (evaluation_session_id) DO NOTHING;
    END LOOP;
END $$;

COMMIT;

