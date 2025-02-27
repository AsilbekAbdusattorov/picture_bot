const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const { Telegraf } = require("telegraf");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// CORS ni sozlash
app.use(cors({
  origin: "https://picture-bot.vercel.app", // Frontend domeni
  methods: ["GET", "POST", "OPTIONS"], // Ruxsat berilgan metodlar
  allowedHeaders: ["Content-Type", "Authorization"], // Ruxsat berilgan sarlavhalar
  credentials: true, // Foydalanuvchi ma'lumotlarini yuborishga ruxsat
}));

app.use(bodyParser.json({ limit: "10mb" })); // Rasmni qabul qilish uchun limitni oshirish
app.use(bodyParser.urlencoded({ extended: true }));

const CHANNEL = "@AsilbekCode"; // Kanal username
const WEBSITE_URL = "https://picture-bot.vercel.app/";
let userSessions = {};

// Telegram bot /start komandasi
bot.start(async (ctx) => {
    const userId = ctx.from.id;
    userSessions[userId] = false;

    ctx.reply("Assalomu alaykum! Kanalga obuna bo‘ling va tekshiring.", {
        reply_markup: {
            inline_keyboard: [
                [{ text: "📢 Kanalga obuna bo‘lish", url: `https://t.me/${CHANNEL.replace("@", "")}` }],
                [{ text: "✅ Tekshirish", callback_data: "check" }]
            ]
        }
    });
});

// Obuna tekshirish
bot.action("check", async (ctx) => {
    const userId = ctx.from.id;
    try {
        const member = await ctx.telegram.getChatMember(CHANNEL, userId);
        if (["member", "administrator", "creator"].includes(member.status)) {
            userSessions[userId] = true;
            const uniqueLink = `${WEBSITE_URL}?id=${userId}`;
            ctx.reply(`✅ Obuna tasdiqlandi! Link: ${uniqueLink}`);
        } else {
            ctx.reply("❌ Siz kanalga obuna bo‘lmadingiz. Obuna bo‘ling va qayta tekshiring.");
        }
    } catch (err) {
        console.error("Xatolik:", err);
        ctx.reply("❌ Xatolik yuz berdi. Keyinroq urinib ko‘ring.");
    }
});

// Frontenddan rasm qabul qilish
app.post("/upload", async (req, res) => {
    const { image, userId } = req.body;
    if (!image || !userId) {
        return res.status(400).json({ error: "Ma'lumot yetarli emas" });
    }

    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    const imagePath = `./uploads/${userId}.png`;
    fs.writeFileSync(imagePath, base64Data, "base64");

    bot.telegram.sendPhoto(userId, { source: imagePath })
        .then(() => res.json({ message: "Rasm botga yuborildi" }))
        .catch(err => res.status(500).json({ error: err.message }));
});

// Serverni ishga tushirish
app.listen(3000, () => console.log("Server 3000-portda ishlayapti!"));
bot.launch();