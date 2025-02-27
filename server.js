const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);
const CHANNEL = "@AsilbekCode"; // Kanal username
const WEBSITE_URL = "https://picture-bot.vercel.app"; // Frontend URL

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

    return ctx.reply("❌ Xatolik yuz berdi. Iltimos, keyinroq urinib ko‘ring.");
  }
});

// 📌 **Foydalanuvchiga rasm yuborish**
const sendPhotoToUser = async (userId, imagePath) => {
  try {
    console.log(`📤 Rasm ${userId} ga yuborilmoqda: ${imagePath}`);
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