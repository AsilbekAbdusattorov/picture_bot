const express = require("express");
const cors = require("cors");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// 📌 **Rasm yuklash API**
app.post("/upload", async (req, res) => {
  console.log("POST /upload so'rovi keldi:", req.body);
  
  const { image, userId } = req.body;
  if (!image || !userId) {
    return res.status(400).json({ error: "Ma'lumot yetarli emas" });
  }

  const base64Data = image.replace(/^data:image\/png;base64,/, "");
  const imagePath = `./uploads/${userId}.png`;

  try {
    fs.writeFileSync(imagePath, base64Data, "base64");
    console.log("✅ Rasm faylga yozildi:", imagePath);
    
    // 📌 Foydalanuvchiga rasm yuborish uchun botga yuboramiz
    const bot = require("./bot");
    bot.sendPhotoToUser(userId, imagePath);

    // ⏳ **10 soniyadan keyin rasmni o‘chirish**
    setTimeout(() => {
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("❌ Rasmni o‘chirishda xatolik:", err);
        } else {
          console.log("🗑️ Rasm fayli o‘chirildi:", imagePath);
        }
      });
    }, 10000); // 10 soniyadan keyin o‘chiriladi

    res.json({ message: "✅ Rasm qabul qilindi" });

  } catch (err) {
    console.error("❌ Xatolik:", err);
    res.status(500).json({ error: err.message });
  }
});

// 📌 **Server ishlayotganini tekshirish**
app.get("/", (req, res) => {
  res.send("✅ Server ishlayapti!");
});

// 📌 **Serverni ishga tushirish**
app.listen(PORT, () => console.log(`🚀 Server ${PORT}-portda ishlayapti!`));
