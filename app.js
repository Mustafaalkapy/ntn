const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 1000;
canvas.height = 1000;

const birdImage = new Image();
birdImage.src = 'https://i.postimg.cc/ZWZwFNPK/netanyahu.png'; // تأكد من استخدام الرابط المباشر

let birdY = canvas.height / 2;
let gravity = 0.3; // تقليل الجاذبية
let birdVelocity = 0;
let columns = [];
let gameStarted = false;
let score = 0;

function drawBird() {
    ctx.drawImage(birdImage, 30, birdY, 150, 150); // تكبير الصورة إلى 60x60
}

function drawColumns() {
    columns.forEach(column => {
        ctx.fillStyle = 'green';
        ctx.fillRect(column.x, 0, 50, column.gapStart);
        ctx.fillRect(column.x, column.gapStart + 150, 50, canvas.height - column.gapStart - 150);
    });
}

function updateColumns() {
    columns.forEach(column => {
        column.x -= 2;
        if (column.x + 50 < 0) {
            column.x = canvas.width;
            column.gapStart = Math.random() * (canvas.height - 300) + 100;
            score++;
        }
    });
}

function detectCollision() {
    for (let column of columns) {
        if (60 + 30 > column.x && 30 - 30 < column.x + 50) { // تعديل القياسات لتناسب الصورة
            if (birdY - 30 < column.gapStart || birdY + 30 > column.gapStart + 150) {
                gameOver();
            }
        }
    }

    if (birdY + 30 > canvas.height || birdY - 30 < 0) {
        gameOver();
    }
}

function gameOver() {
    alert('Game Over! Score: ' + score);
    document.location.reload();
}

function gameLoop() {
    if (!gameStarted) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    birdVelocity += gravity;
    birdY += birdVelocity;

    drawBird();
    drawColumns();
    updateColumns();
    detectCollision();

    requestAnimationFrame(gameLoop);
}

function startGame() {
    gameStarted = true;
    birdY = canvas.height / 2;
    birdVelocity = 0;
    score = 0;

    columns = [
        { x: canvas.width, gapStart: Math.random() * (canvas.height - 300) + 100 },
        { x: canvas.width + 200, gapStart: Math.random() * (canvas.height - 300) + 100 }
    ];

    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function(stream) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const microphone = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            microphone.connect(analyser);
            analyser.fftSize = 512;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            function checkVolume() {
                analyser.getByteFrequencyData(dataArray);
                const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;
                if (volume > 50) {
                    birdVelocity = -10; // زيادة الارتفاع عند رفع الصوت
                }
                requestAnimationFrame(checkVolume);
            }

            checkVolume();
        })
        .catch(function(err) {
            console.log('The following error occurred: ' + err);
        });
    }

    gameLoop();
}