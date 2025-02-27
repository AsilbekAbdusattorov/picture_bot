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
  const imagePath = `./temp/${userId}.png`;

  try {
    fs.writeFileSync(imagePath, base64Data, "base64");
    res.json({ message: "✅ Rasm qabul qilindi" });

    // 📌 Foydalanuvchiga rasm yuborish uchun botga yuboramiz
    const bot = require("./bot");
    bot.sendPhotoToUser(userId, imagePath);
    
    // Serverdan rasmni o‘chirish
    fs.unlinkSync(imagePath);
  } catch (err) {
    console.error("Xatolik:", err);
    res.status(500).json({ error: err.message });
  }
});

// 📌 **Server ishlayotganini tekshirish**
app.get("/", (req, res) => {
  res.send("✅ Server ishlayapti!");
});

// 📌 **Serverni ishga tushirish**
app.listen(PORT, () => console.log(`🚀 Server ${PORT}-portda ishlayapti!`));