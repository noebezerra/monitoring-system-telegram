const oracledb = require('oracledb');
const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
dotenv.config();

const cron = require('node-cron');

// Habilita o modo Thick
// oracledb.initOracleClient({ libDir: 'C:/caminho/para/o/instantclient' }); // Windows
// ou
oracledb.initOracleClient({
  libDir: '/opt/oracle/instantclient',
}); // Linux/macOS

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// Configurações do banco de dados Oracle
const dbConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASSWORD,
  connectString: `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_DATABASE}`,
};

// Configurações do bot do Telegram
const botToken = process.env.TELEGRAM_TOKEN;
const chatId = process.env.TELEGRAM_ID;

// Inicializando o bot do Telegram
const bot = new TelegramBot(botToken, { polling: false });

// Conexão com o banco de dados
let _connection;

// Função para conectar ao banco de dados
async function conectarBanco() {
  try {
    _connection = await oracledb.getConnection(dbConfig);
    return _connection;
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    return null;
  }
}

// Função para obter as lojas não fechadas
async function getLojas() {
  try {
    const result = await _connection.execute(
      `
        SELECT 
        tpe.T908_UNIDADE_IE AS FILIAL
        , tu.T003_NOME NOME_FILIAL
        , CASE tpe.T908_MODO_ENCERRAMENTO 
          WHEN 'A' THEN 'AUTOMATICO'
          WHEN 'M' THEN 'MANUAL'
        END AS MODO_ENCERRAMENTO
        , tpe.T908_DATA_FATURAMENTO AS DT_FATURAMENTO
        , tpe.T908_DATA_FATURA_ANT AS DT_FATURAMENTO_ANT
        , tpe.T908_USUARIO_ENCERRAMENTO_E AS USUARIO_ENCERRAMENTO
        FROM DBAMDATA.T908_PARAM_EMPRESA tpe 
        INNER JOIN DBAMDATA.T003_UNIDADE tu 
        ON tu.T003_UNIDADE_IU = TPE.T908_UNIDADE_IE 
        WHERE TPE.T908_UNIDADE_IE IN (
          SELECT TAED.T252_UNIDADE_IE 
          FROM DBAMDATA.T252_AGENDA_ENCERRAMENTO_DIA taed 
          WHERE TAED.T252_ATIVO = 'S'
        )
        AND tpe.T908_DATA_FATURAMENTO < TRUNC(SYSDATE)
        ORDER BY TPE.T908_UNIDADE_IE
      `
    );
    if (Array.isArray(result.rows)) {
      return result.rows.map((o) => `${o.FILIAL} - ${o.NOME_FILIAL}`);
    }
    return [];
  } catch (error) {
    console.error('Erro ao executar consulta:', error);
    return [];
  }
}

// Função para enviar mensagens
async function enviarMensagens(mensagem) {
  try {
    await bot.sendMessage(chatId, mensagem, { parse_mode: 'HTML' });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
  }
}

// Função principal
async function main() {
  try {
    // Conectar ao banco de dados
    await conectarBanco();

    // Obter as lojas não fechadas
    const lojas = await getLojas();

    // Verificar se há lojas não fechadas
    let mensagem = '';
    if (lojas.length > 0) {
      mensagem = `🔴 [ MDLOG ] Atenção!\nHá loja(s) não fechada(s):\n<code>${lojas.join(
        '\n'
      )}</code>`;
    } else {
      mensagem = `
        ✅ [ MDLOG ] Todos os fechamentos foram realizados com sucesso!
      `;
    }

    // Enviar mensagem para o Telegram
    await enviarMensagens(mensagem);
  } catch (error) {
    console.error('Erro ao executar consulta:', error);
  } finally {
    // Fechar a conexão com o banco de dados
    if (_connection) {
      try {
        console.log('Fechando conexão...');
        await _connection.close();
      } catch (error) {
        console.error('Erro ao fechar conexão:', error);
      }
    }
  }
}

//segundos(opcional) | minutos | horas | dia do mes | mes | dia da semana
cron.schedule('0 6 * * *', async () => {
  try {
    console.log('Iniciando execução...');
    await main();
    console.log('Execução finalizada.');
  } catch (error) {
    console.error('Erro ao executar consulta:', error);
  }
});
