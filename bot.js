const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// 📌 Middleware
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

// 📂 Rasm yuklash uchun katalogni tekshirish
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("📂 'uploads' katalogi yaratildi.");
}

// 📌 **Rasm yuklash API**
app.post("/upload", async (req, res) => {
    console.log("✅ POST /upload so‘rovi qabul qilindi.");

    const { image, userId } = req.body;
    if (!image || !userId) {
        console.error("❌ Xatolik: Ma'lumot yetarli emas.");
        return res.status(400).json({ error: "Ma'lumot yetarli emas" });
    }

    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    const imagePath = path.join(uploadDir, `${userId}.png`);

    try {
        // 📌 Rasm faylga yoziladi
        fs.writeFileSync(imagePath, base64Data, "base64");
        console.log(`✅ Rasm saqlandi: ${imagePath}`);

        // 📌 Bot orqali foydalanuvchiga yuborish
        const { sendPhotoToUser } = require("./bot");
        sendPhotoToUser(userId, imagePath);

        res.json({ success: true, message: "Rasm muvaffaqiyatli yuklandi!", path: imagePath });

        // ⏳ 10 soniyadan keyin rasm o‘chiriladi
        setTimeout(() => {
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error("❌ Rasmni o‘chirishda xatolik:", err);
                } else {
                    console.log(`🗑️ Rasm o‘chirildi: ${imagePath}`);
                }
            });
        }, 10000);
    } catch (err) {
        console.error("❌ Xatolik: Rasmni saqlashda muammo yuz berdi.", err);
        res.status(500).json({ error: "Ichki server xatosi" });
    }
});

// 📌 Serverni ishga tushirish
app.listen(PORT, () => {
    console.log(`🚀 Server ishga tushdi: http://localhost:${PORT}`);
});
