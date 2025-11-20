BEGIN;

ALTER TABLE sys.evaluation_sessions DROP COLUMN IF EXISTS input_data;
ALTER TABLE sys.evaluation_sessions DROP COLUMN IF EXISTS facts_detected;
ALTER TABLE sys.evaluation_sessions DROP COLUMN IF EXISTS evaluation_result;
ALTER TABLE sys.evaluation_sessions DROP COLUMN IF EXISTS recommended_products;

ALTER TABLE sys.rule_executions DROP COLUMN IF EXISTS rule_conditions;
ALTER TABLE sys.rule_executions DROP COLUMN IF EXISTS rule_facts_used;

COMMIT;

