import axios from 'axios';

export async function sendTelegramMessage(botToken: string, chatId: string, text: string) {
  try {
    const response = await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text: text,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error sending Telegram message:', error.response?.data || error.message);
    throw error;
  }
}
