const pool = require('./config/database');

async function testConnection() {
  try {
    console.log('🔄 Tentando conectar ao banco de dados...');
    
    // Testar a conexão
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    
    console.log('✅ Conexão com MySQL estabelecida com sucesso!');
    console.log('📊 Teste de query:', rows[0]);
    
    // Verificar o banco de dados atual
    const [dbInfo] = await pool.query('SELECT DATABASE() AS db_name');
    console.log('📁 Banco de dados conectado:', dbInfo[0].db_name);
    
    // Fechar o pool de conexões
    await pool.end();
    console.log('🔒 Conexão encerrada.');
    
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:');
    console.error('Mensagem:', error.message);
    console.error('Código:', error.code);
    process.exit(1);
  }
}

// Executar o teste
testConnection();
