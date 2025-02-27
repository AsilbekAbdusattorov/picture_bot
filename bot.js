// const express = require('express');
// const multer = require('multer');
// const TelegramBot = require('node-telegram-bot-api');
// const fs = require('fs');

// const app = express();
// const port = 3000;

// // Telegram Bot Token
// const token = '7002923739:AAFyquVzbm2I5uZeKjcTsGoTsiaS7tA-5F0'; // Token ni to'g'ri kiriting
// const bot = new TelegramBot(token, { polling: true });

// // Rasmni saqlash uchun multer
// const upload = multer({ dest: 'uploads/' });

// // Web sayt uchun statik fayllar
// app.use(express.static('public'));

// // Rasmni qabul qilish
// app.post('/upload', upload.single('photo'), (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ error: 'Rasm yuborilmadi.' });
//   }

//   // Rasmni Telegram botga yuborish
//   const photoPath = req.file.path;
//   const CHAT_ID = '6034280125'; // O'z CHAT_ID ingizni kiriting

//   bot.sendPhoto(CHAT_ID, fs.readFileSync(photoPath))
//     .then(() => {
//       res.json({ success: true });
//     })
//     .catch(err => {
//       console.error('Rasm yuborishda xatolik:', err);
//       res.status(500).json({ error: 'Rasm yuborishda xatolik yuz berdi.' });
//     });
// });

// // Serverni ishga tushirish
// app.listen(port, () => {
//   console.log(`Server http://localhost:${port} da ishga tushdi.`);
// });


const { Telegraf } = require("telegraf");
const axios = require("axios");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();
app.use(bodyParser.json());
app.use(require("cors")());

const CHANNELS = ["@https://t.me/AsilbekCode"]; // Kanal username
const WEBSITE_URL = "https://picture-bot.vercel.app/"; // Sayt URL
let userSessions = {}; // Foydalanuvchilarni kuzatish

// Telegram bot /start komandasi
bot.start(async (ctx) => {
    const userId = ctx.from.id;
    userSessions[userId] = false; // Obunani tekshirmagan

    ctx.reply(
        "Assalomu alaykum! Botdan foydalanish uchun kanalimizga obuna bo‘ling.",
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "📢 Kanalga obuna bo‘lish", url: `https://t.me/${CHANNELS[0].replace("@", "")}` }],
                    [{ text: "✅ Tekshirish", callback_data: "check" }]
                ]
            }
        }
    );
});

// Obuna tekshirish
bot.action("check", async (ctx) => {
    const userId = ctx.from.id;
    
    try {
        const member = await ctx.telegram.getChatMember(CHANNELS[0], userId);
        if (["member", "administrator", "creator"].includes(member.status)) {
            userSessions[userId] = true;
            const uniqueLink = `${WEBSITE_URL}?id=${userId}`;
            ctx.reply(`✅ Rahmat! Endi bu link orqali kiring va rasmga tushing:\n${uniqueLink}`);
        } else {
            ctx.reply("❌ Siz hali kanalga obuna bo‘lmadingiz. Obuna bo‘lib, tekshiring.");
        }
    } catch (err) {
        ctx.reply("❌ Kanalga obuna bo‘lishingiz shart!");
    }
});

// Frontenddan rasm qabul qilish
app.post("/upload", async (req, res) => {
    const { image, userId } = req.body;

    if (!image || !userId) {
        return res.status(400).json({ error: "Malumot yetarli emas" });
    }

    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    const imagePath = `./uploads/${userId}.png`;
    fs.writeFileSync(imagePath, base64Data, "base64");

    bot.telegram.sendPhoto(userId, { source: imagePath })
        .then(() => res.json({ message: "Rasm botga yuborildi" }))
        .catch(err => res.status(500).json({ error: err.message }));
});

app.listen(3000, () => console.log("Server 3000-portda ishlayapti!"));
bot.launch();
