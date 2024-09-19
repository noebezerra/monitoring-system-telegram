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
  connectString: `${process.env.ORACLE_HOST}/${process.env.ORACLE_DATABASE}`,
};

// Configurações do bot do Telegram
const botToken = process.env.TELEGRAM_TOKEN;
const chatId = process.env.TELEGRAM_ID;

// Inicializando o bot do Telegram
const bot = new TelegramBot(botToken, { polling: false });

// Função para ler a tabela e enviar mensagens
async function enviarMensagens() {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `
        SELECT * FROM DBAMDATA.LOG_FECHA_DIA lfd 
        WHERE 1=1
        AND LFD.DATA_HORA >= TO_DATE(TO_CHAR(SYSDATE , 'YYYY-MM-DD'), 'YYYY-MM-DD')
        AND LFD.DATA_HORA < TO_DATE(TO_CHAR(SYSDATE + 1, 'YYYY-MM-DD'), 'YYYY-MM-DD')
        AND LFD.PROCESSO LIKE '%sucesso%'
        ORDER BY LFD.INDICE
      `,
      []
    );
    const lojas = [
      101, 102, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 309,
    ];

    if (Array.isArray(result.rows)) {
      const closed = result.rows.map((o) => o.INDICE);
      const open = lojas.filter((o) => !closed.includes(o));
      if (open.length > 1) {
        const mensagem = `
          🔴 [ MDLOG ] Atenção!\nHá loja(s) não fechada(s): ${open.join(', ')}
        `;
        bot.sendMessage(chatId, mensagem);
      }
    }
  } catch (error) {
    console.error('Erro ao executar consulta:', error);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error('Erro ao fechar conexão:', error);
      }
    }
  }
}

//segundos(opcional) | minutos | horas | dia do mes | mes | dia da semana
cron.schedule('*/2 * * * *', () => {
  enviarMensagens();
});
