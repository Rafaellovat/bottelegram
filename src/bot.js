const TelegramBot = require('node-telegram-bot-api');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


// replace the value below with the Telegram token you receive from @BotFather
const token = '7182995084:AAGd7e4JOLtMiAw1jssnBsFBQDMIX_sc63Q';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

function isHorarioComercial() {
    const now = new Date();
    const hora = now.getHours();
    const diaDaSemana = now.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    return hora >= 11 && hora < 18 && diaDaSemana >= 1 && diaDaSemana <= 5; // Verifica se está entre 9h e 18h de segunda a sexta
}

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});


// Função para aguardar a próxima mensagem do usuário e salvar o e-mail
async function aguardarProximaMensagemForaDoHorario(chatId) {
    bot.once('message', async (msg) => {
        const messageContent = msg.text || '';

        try {
            await prisma.user.create({
                data: {
                    email: messageContent
                }
            });
            bot.sendMessage(chatId, `E-mail salvo com sucesso: ${messageContent}`);
        } catch (error) {
            bot.sendMessage(chatId, `Erro ao salvar o e-mail: ${error.toString()}`);
        }
    });
}

// Evento de mensagem
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    
    //if (msg.message_id === 1) {
        // Verificar se é a primeira mensagem da conversa
        if (isHorarioComercial()) {
            bot.sendMessage(chatId, 'https://uvv.br');
        } else {
            bot.sendMessage(chatId, 'Estamos fora de horário comercial. Informe seu e-mail para que possamos entrar em contato assim que possível');
            // Chamar a função para aguardar a próxima mensagem do usuário
            await aguardarProximaMensagemForaDoHorario(chatId);
        }
    //}
});




    
