-- Script completo para configurar todos los datos del sistema experto
-- Basado en las reglas R001-R052 del documento sistema.txt
-- Ejecutar en el siguiente orden:

-- 1. Poblar facts del sistema experto
\i populate-system-facts.sql

-- 2. Poblar failures del sistema experto  
\i populate-system-failures.sql

-- 3. Crear relaciones facts-failures
\i populate-facts-failures-relations.sql

-- Verificar que los datos se insertaron correctamente
SELECT 'FACTS INSERTADOS:' as tipo, COUNT(*) as cantidad FROM sys.facts;
SELECT 'FAILURES INSERTADOS:' as tipo, COUNT(*) as cantidad FROM sys.failures;
SELECT 'RELACIONES INSERTADAS:' as tipo, COUNT(*) as cantidad FROM sys.facts_failures;

-- Mostrar algunos ejemplos de facts insertados
SELECT 'EJEMPLOS DE FACTS:' as tipo, code, description FROM sys.facts LIMIT 10;

-- Mostrar algunos ejemplos de failures insertados
SELECT 'EJEMPLOS DE FAILURES:' as tipo, name, description FROM sys.failures LIMIT 10;

-- Mostrar algunas relaciones creadas
SELECT 'EJEMPLOS DE RELACIONES:' as tipo, 
       f.code as fact_code, 
       fail.name as failure_name
FROM sys.facts_failures ff
JOIN sys.facts f ON ff.fact_id = f.id
JOIN sys.failures fail ON ff.failure_id = fail.id
LIMIT 10;
