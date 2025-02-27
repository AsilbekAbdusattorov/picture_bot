const { Telegraf } = require("telegraf");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const CHANNEL = "@AsilbekCode"; // Kanal username

let userSessions = {};

// 📌 **Botni ishga tushirish**
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
      ctx.reply(`✅ Obuna tasdiqlandi!`);
    } else {
      ctx.reply("❌ Siz kanalga obuna bo‘lmadingiz. Obuna bo‘ling va qayta tekshiring.");
    }
  } catch (err) {
    console.error("Xatolik:", err);
    ctx.reply("❌ Xatolik yuz berdi. Keyinroq urinib ko‘ring.");
  }
});

// 📌 **Foydalanuvchiga rasm yuborish**
const sendPhotoToUser = async (userId, imagePath) => {
  try {
    await bot.telegram.sendPhoto(userId, { source: imagePath });
  } catch (err) {
    console.error("❌ Rasm yuborishda xatolik:", err);
  }
};

// 📌 **Botni ishga tushirish**
bot.launch();
console.log("🤖 Bot ishga tushdi!");

module.exports = { sendPhotoToUser };
