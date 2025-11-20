BEGIN;

CREATE TABLE IF NOT EXISTS sys.product_recommendation_special_conditions (
    id SERIAL PRIMARY KEY,
    product_recommendation_id INTEGER NOT NULL,
    condition_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_product_recommendation_special_conditions_recommendation FOREIGN KEY (product_recommendation_id) REFERENCES sys.product_recommendations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sys.product_template_special_conditions (
    id SERIAL PRIMARY KEY,
    product_template_id INTEGER NOT NULL,
    condition_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_product_template_special_conditions_template FOREIGN KEY (product_template_id) REFERENCES sys.product_templates(id) ON DELETE CASCADE
);

DO $$ 
DECLARE
    rec_record RECORD;
    condition_item TEXT;
BEGIN
    FOR rec_record IN SELECT id, special_conditions FROM sys.product_recommendations WHERE special_conditions IS NOT NULL
    LOOP
        FOR condition_item IN SELECT jsonb_array_elements_text(rec_record.special_conditions)
        LOOP
            INSERT INTO sys.product_recommendation_special_conditions (product_recommendation_id, condition_text)
            VALUES (rec_record.id, condition_item)
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;

    FOR rec_record IN SELECT id, special_conditions FROM sys.product_templates WHERE special_conditions IS NOT NULL
    LOOP
        FOR condition_item IN SELECT jsonb_array_elements_text(rec_record.special_conditions)
        LOOP
            INSERT INTO sys.product_template_special_conditions (product_template_id, condition_text)
            VALUES (rec_record.id, condition_item)
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

ALTER TABLE sys.product_recommendations DROP COLUMN IF EXISTS special_conditions;
ALTER TABLE sys.product_templates DROP COLUMN IF EXISTS special_conditions;

CREATE INDEX IF NOT EXISTS idx_product_recommendation_special_conditions_recommendation_id ON sys.product_recommendation_special_conditions(product_recommendation_id);
CREATE INDEX IF NOT EXISTS idx_product_template_special_conditions_template_id ON sys.product_template_special_conditions(product_template_id);

COMMIT;

