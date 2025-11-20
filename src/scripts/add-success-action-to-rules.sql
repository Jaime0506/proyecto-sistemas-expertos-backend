BEGIN;

-- Agregar columna success_action a la tabla rules si no existe
ALTER TABLE sys.rules ADD COLUMN IF NOT EXISTS success_action VARCHAR(100);

-- Actualizar las reglas con sus success_action correspondientes
UPDATE sys.rules SET success_action = 'RIESGO_BAJO' WHERE code = 'R010';
UPDATE sys.rules SET success_action = 'RIESGO_MEDIO' WHERE code = 'R011';
UPDATE sys.rules SET success_action = 'RIESGO_ALTO' WHERE code = 'R012';
UPDATE sys.rules SET success_action = 'CREDITO_HIPOTECARIO' WHERE code = 'R020';
UPDATE sys.rules SET success_action = 'CREDITO_VEHICULO' WHERE code = 'R021';
UPDATE sys.rules SET success_action = 'CREDITO_LIBRE_INVERSION' WHERE code = 'R022';
UPDATE sys.rules SET success_action = 'TARJETA_CREDITO' WHERE code = 'R023';
UPDATE sys.rules SET success_action = 'CREDITO_VEHICULO_CONDICIONADO' WHERE code = 'R030';
UPDATE sys.rules SET success_action = 'CREDITO_CON_CODEUDOR' WHERE code = 'R031';
UPDATE sys.rules SET success_action = 'MICROCREDITO' WHERE code = 'R032';
UPDATE sys.rules SET success_action = 'CREDITO_VEHICULO_ALTO_RIESGO' WHERE code = 'R033';
UPDATE sys.rules SET success_action = 'MICROCREDITO_ALTO_RIESGO' WHERE code = 'R034';
UPDATE sys.rules SET success_action = 'TARJETA_CREDITO_CONDICIONADA' WHERE code = 'R035';
UPDATE sys.rules SET success_action = 'CLIENTE_PREFERENCIAL' WHERE code = 'R050';
UPDATE sys.rules SET success_action = 'CREDITO_NOMINA' WHERE code = 'R051';
UPDATE sys.rules SET success_action = 'CREDITO_PENSIONADOS' WHERE code = 'R052';

COMMIT;

