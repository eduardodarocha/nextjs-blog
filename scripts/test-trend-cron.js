require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const http = require('http');

async function testLocalTrendCron() {
  console.log('🚀 Executando teste local do Agente de Tendências...');

  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ ERRO: GEMINI_API_KEY não configurada no arquivo .env.local!');
    process.exit(1);
  }

  if (!process.env.GITHUB_TOKEN) {
    console.error('❌ ERRO: GITHUB_TOKEN não configurada no arquivo .env.local!');
    process.exit(1);
  }

  const cronSecret = process.env.CRON_SECRET || '';

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/cron/generate-trend-post',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${cronSecret}`,
    },
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log(`Status: ${res.statusCode}`);
      try {
        console.log('Resposta:', JSON.parse(data));
      } catch {
        console.log('Resposta bruta:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Não foi possível conectar ao servidor local Next.js (http://localhost:3000):`, e.message);
    console.log('💡 Certifique-se de estar rodando "npm run dev" em outro terminal!');
  });

  req.end();
}

testLocalTrendCron();
