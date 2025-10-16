const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Función para ejecutar un script SQL
async function runSqlScript(scriptPath) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔄 Ejecutando script: ${scriptPath}`);
    
    // Leer el contenido del script
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    
    // Ejecutar el script usando psql (ajustar según tu configuración de BD)
    const command = `psql -h localhost -U postgres -d sistema_expertos -c "${scriptContent.replace(/"/g, '\\"')}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error ejecutando ${scriptPath}:`, error.message);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.warn(`⚠️  Advertencias en ${scriptPath}:`, stderr);
      }
      
      console.log(`✅ Script ${scriptPath} ejecutado exitosamente`);
      console.log(`📊 Output:`, stdout);
      resolve(stdout);
    });
  });
}

// Función principal
async function main() {
  try {
    console.log('🚀 Iniciando configuración del sistema experto...');
    
    const scriptsDir = __dirname;
    
    // Ejecutar scripts en orden
    const scripts = [
      'populate-system-facts.sql',
      'populate-system-failures.sql', 
      'populate-facts-failures-relations.sql'
    ];
    
    for (const script of scripts) {
      const scriptPath = path.join(scriptsDir, script);
      await runSqlScript(scriptPath);
    }
    
    console.log('\n🎉 ¡Configuración del sistema experto completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en la configuración:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { runSqlScript };
