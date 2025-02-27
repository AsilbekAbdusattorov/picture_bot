const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const { Telegraf } = require("telegraf");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

const PORT = process.env.PORT || 3000;
const WEBSITE_URL = "https://picture-bot.vercel.app/";
const CHANNEL = "@AsilbekCode"; // Kanal username

app.use(cors({
  origin: WEBSITE_URL, 
  methods: ["GET", "POST", "OPTIONS"], 
  allowedHeaders: ["Content-Type", "Authorization"], 
  credentials: true
}));

app.use(bodyParser.json({ limit: "10mb" })); 
app.use(bodyParser.urlencoded({ extended: true }));

let userSessions = {};

// 📌 **Webhook URL-ni Render uchun moslashtirish**
const WEBHOOK_URL = `https://your-render-app.onrender.com/webhook`; // ⬅ Bu yerni Render URL bilan almashtiring

bot.telegram.setWebhook(WEBHOOK_URL);
app.post("/webhook", (req, res) => {
  bot.handleUpdate(req.body);
  res.sendStatus(200);
});

// 📌 **Telegram bot /start komandasi**
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

// 📌 **Obuna tekshirish**
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

// 📌 **Frontenddan rasm qabul qilish**
app.post("/upload", async (req, res) => {
    const { image, userId } = req.body;
    if (!image || !userId) {
        return res.status(400).json({ error: "Ma'lumot yetarli emas" });
    }

    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    const imagePath = `./uploads/${userId}.png`;

    try {
        fs.writeFileSync(imagePath, base64Data, "base64");

        await bot.telegram.sendPhoto(userId, { source: imagePath });

        res.json({ message: "✅ Rasm botga yuborildi" });

        // Faylni serverdan o'chirish
        fs.unlinkSync(imagePath);
    } catch (err) {
        console.error("Xatolik:", err);
        res.status(500).json({ error: err.message });
    }
});

// 📌 **Serverni ishga tushirish**
app.listen(PORT, () => console.log(`🚀 Server ${PORT}-portda ishlayapti!`));
