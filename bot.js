// const express = require("express");
// const cors = require("cors");
// const fs = require("fs");
// const path = require("path");
// require("dotenv").config();

// const app = express();
// const PORT = process.env.PORT || 3000;

// // 📌 Middleware
// app.use(cors());
// app.use(express.json({ limit: "20mb" }));
// app.use(express.urlencoded({ extended: true }));

// // 📂 Rasm yuklash uchun katalogni tekshirish
// const uploadDir = path.join(__dirname, "uploads");
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
//     console.log("📂 'uploads' katalogi yaratildi.");
// }

// // 📌 **Asosiy sahifa (`/`)**
// app.get("/", (req, res) => {
//     res.send("✅ Server ishlamoqda!");
// });

// // 📌 **Rasm yuklash API**
// app.post("/upload", async (req, res) => {
//   console.log("✅ POST /upload so‘rovi qabul qilindi.");

//   const { image, userId } = req.body;
//   if (!image || !userId) {
//       console.error("❌ Xatolik: Ma'lumot yetarli emas.");
//       return res.status(400).json({ error: "Ma'lumot yetarli emas" });
//   }

//   const base64Data = image.replace(/^data:image\/png;base64,/, "");
//   const imagePath = path.join(uploadDir, `${userId}.png`);

//   try {
//       // 📌 Rasm faylga yoziladi
//       fs.writeFileSync(imagePath, base64Data, "base64");
//       console.log(`✅ Rasm saqlandi: ${imagePath}`);

//       // 📌 Bot orqali foydalanuvchiga yuborish
//       const { sendPhotoToUser } = require("./bot");
//       sendPhotoToUser(userId, imagePath);

//       res.json({ success: true, message: "Rasm muvaffaqiyatli yuklandi!", path: imagePath });

//       // ⏳ 10 soniyadan keyin rasm o‘chiriladi
//       setTimeout(() => {
//           fs.unlink(imagePath, (err) => {
//               if (err) {
//                   console.error("❌ Rasmni o‘chirishda xatolik:", err);
//               } else {
//                   console.log(`🗑️ Rasm o‘chirildi: ${imagePath}`);
//               }
//           });
//       }, 10000);
//   } catch (err) {
//       console.error("❌ Xatolik: Rasmni saqlashda muammo yuz berdi.", err);
//       res.status(500).json({ error: "Ichki server xatosi" });
//   }
// });

// // 📌 Serverni ishga tushirish
// app.listen(PORT, () => {
//     console.log(`🚀 Server ishga tushdi: http://localhost:${PORT}`);
// });


const { Telegraf } = require("telegraf");
const fs = require("fs");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const CHANNEL = "@AsilbekCode"; // Kanal username
const WEBSITE_URL = "https://picture-bot.vercel.app/"; // Frontend URL

let userSessions = {};

// 📌 **Botni ishga tushirish**
bot.start(async (ctx) => {
  if (!ctx.from) return; // Foydalanuvchi aniqlanmagan bo‘lsa, hech narsa qilmaymiz

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
  if (!ctx.from) return ctx.reply("❌ Xatolik: foydalanuvchi aniqlanmadi.");

  const userId = ctx.from.id;
  try {
    const member = await ctx.telegram.getChatMember(CHANNEL, userId);
    
    if (["member", "administrator", "creator"].includes(member.status)) {
      userSessions[userId] = true;
      const uniqueLink = `${WEBSITE_URL}?id=${userId}`;
      return ctx.reply(`✅ Obuna tasdiqlandi! Link: ${uniqueLink}`);
    } else {
      return ctx.reply("❌ Siz kanalga obuna bo‘lmadingiz. Obuna bo‘ling va qayta tekshiring.");
    }
  } catch (err) {
    console.error("❌ Xatolik:", err);

    // ⚠️ Agar bot kanal admini bo‘lmasa, 403 xatolik qaytishi mumkin
    if (err.response && err.response.error_code === 403) {
      return ctx.reply("❌ Bot kanal admini emas! Botni kanalga admin qilib qo‘ying.");
    }

    return ctx.reply("❌ Xatolik yuz berdi. Keyinroq urinib ko‘ring.");
  }
});

const sendPhotoToUser = async (userId, imagePath) => {
    try {
        console.log(`📤 Rasm ${userId} ga yuborilmoqda: ${imagePath}`);
        
        if (!fs.existsSync(imagePath)) {
            console.error("❌ Xatolik: Rasm fayli mavjud emas!");
            return;
        }

        await bot.telegram.sendPhoto(userId, { source: imagePath });

        console.log(`✅ Rasm muvaffaqiyatli yuborildi: ${imagePath}`);
    } catch (err) {
        console.error("❌ Rasm yuborishda xatolik:", err);
    }
};

// 📌 **Botni ishga tushirish**
bot.launch();
console.log("🤖 Bot ishga tushdi!");

module.exports = { sendPhotoToUser };