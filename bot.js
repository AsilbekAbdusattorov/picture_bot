const express = require('express');
const multer = require('multer');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const port = 3000;

// Telegram Bot Token
const token = '7002923739:AAFyquVzbm2I5uZeKjcTsGoTsiaS7tA-5F0';
const bot = new TelegramBot(token, { polling: true });

// Rasmni saqlash uchun multer
const upload = multer({ dest: 'uploads/' });

// Web sayt uchun statik fayllar
app.use(express.static('public'));

// Rasmni qabul qilish
app.post('/upload', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Rasm yuborilmadi.' });
  }

  // Rasmni Telegram botga yuborish
  const photoPath = req.file.path;
  bot.sendPhoto(CHAT_ID, photoPath) // CHAT_ID ni o'zgartiring
    .then(() => {
      res.json({ success: true });
    })
    .catch(err => {
      console.error('Rasm yuborishda xatolik:', err);
      res.status(500).json({ error: 'Rasm yuborishda xatolik yuz berdi.' });
    });
});

// Botni ishga tushirish
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const text = `Assalomu alaykum! Quyidagi kanallarga obuna bo'ling:\n\n` +
               `1. Telegram: https://t.me/AsilbekCOde\n` +
               `2. Instagram: https://instagram.com/asilbekcode\n\n` +
               `Obuna bo'lganingizdan so'ng, "Tekshirish" tugmasini bosing.`;
  bot.sendMessage(chatId, text, {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Tekshirish', callback_data: 'check_subscription' }]
      ]
    }
  });
});

// Obunani tekshirish
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  if (query.data === 'check_subscription') {
    // Bu yerda obunani tekshirish logikasini qo'shing
    bot.sendMessage(chatId, 'Obuna tekshirildi! Link: https://yourwebsite.com');
  }
});

// Serverni ishga tushirish
app.listen(port, () => {
  console.log(`Server http://localhost:${port} da ishga tushdi.`);
});