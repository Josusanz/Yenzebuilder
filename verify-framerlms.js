// Quick verification script for framerlms.com
// Run this anytime to check if the domain is working correctly

const http = require('http');
const https = require('https');

console.log('🔍 Verificando framerlms.com...\n');

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject).on('timeout', () => reject(new Error('Timeout')));
  });
}

async function verify() {
  // Test 1: Apex domain
  console.log('📍 Probando framerlms.com (apex)...');
  try {
    const response = await httpGet('http://framerlms.com/api/serve-project?domain=framerlms.com');
    if (response.body.includes('YENZE') && response.body.length > 10000) {
      console.log('   ✅ FUNCIONA - Contenido correcto cargado');
      console.log(`   📊 ${response.body.length} caracteres\n`);
    } else {
      console.log('   ❌ NO FUNCIONA - Aún muestra redirect de GoDaddy');
      console.log(`   📄 Respuesta: ${response.body.substring(0, 100)}\n`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 2: WWW subdomain
  console.log('📍 Probando www.framerlms.com...');
  try {
    const response = await httpGet('http://www.framerlms.com/api/serve-project?domain=www.framerlms.com');
    if (response.body.includes('YENZE') && response.body.length > 10000) {
      console.log('   ✅ FUNCIONA - Contenido correcto cargado');
      console.log(`   📊 ${response.body.length} caracteres\n`);
    } else {
      console.log('   ❌ NO FUNCIONA');
      console.log(`   📄 Respuesta: ${response.body.substring(0, 100)}\n`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  console.log('━'.repeat(60));
  console.log('\n💡 Nota: Si aún no funciona, espera 5-15 minutos para que');
  console.log('   se propague el cambio de DNS de GoDaddy.\n');
}

verify();
