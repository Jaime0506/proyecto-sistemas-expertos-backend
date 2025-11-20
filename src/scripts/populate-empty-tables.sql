BEGIN;

INSERT INTO sys.rule_facts (rule_id, fact_id, position)
SELECT r.id, f.id, 
    ROW_NUMBER() OVER (PARTITION BY r.id ORDER BY f.id) - 1 as position
FROM sys.rules r
CROSS JOIN sys.facts f
WHERE EXISTS (
    SELECT 1 FROM sys.rule_facts rf 
    WHERE rf.rule_id = r.id AND rf.fact_id = f.id
) = FALSE
AND EXISTS (
    SELECT 1 FROM sys.rule_facts rf 
    WHERE rf.rule_id = r.id
) = FALSE
ON CONFLICT (rule_id, fact_id) DO NOTHING;

DO $$ 
DECLARE
    rule_record RECORD;
    fact_code TEXT;
    fact_record RECORD;
    position_counter INTEGER;
BEGIN
    FOR rule_record IN SELECT id, code FROM sys.rules WHERE id NOT IN (SELECT DISTINCT rule_id FROM sys.rule_facts WHERE rule_id IS NOT NULL)
    LOOP
        position_counter := 0;
        
        IF rule_record.code LIKE 'R%' THEN
            CASE rule_record.code
                WHEN 'R001' THEN
                    FOR fact_code IN SELECT unnest(ARRAY['FACT_EDAD_18_75', 'FACT_INGRESOS_MIN_1_SMMLV']) LOOP
                        SELECT id INTO fact_record FROM sys.facts WHERE code = fact_code;
                        IF fact_record.id IS NOT NULL THEN
                            INSERT INTO sys.rule_facts (rule_id, fact_id, position) 
                            VALUES (rule_record.id, fact_record.id, position_counter)
                            ON CONFLICT (rule_id, fact_id) DO NOTHING;
                            position_counter := position_counter + 1;
                        END IF;
                    END LOOP;
                WHEN 'R002' THEN
                    FOR fact_code IN SELECT unnest(ARRAY['FACT_EDAD_18_75', 'FACT_INGRESOS_MIN_2_SMMLV']) LOOP
                        SELECT id INTO fact_record FROM sys.facts WHERE code = fact_code;
                        IF fact_record.id IS NOT NULL THEN
                            INSERT INTO sys.rule_facts (rule_id, fact_id, position) 
                            VALUES (rule_record.id, fact_record.id, position_counter)
                            ON CONFLICT (rule_id, fact_id) DO NOTHING;
                            position_counter := position_counter + 1;
                        END IF;
                    END LOOP;
                ELSE
                    NULL;
            END CASE;
        END IF;
    END LOOP;
END $$;

COMMIT;

