const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartBtn = document.getElementById('restartBtn');

canvas.width = 400;
canvas.height = 600;

const birdImage = new Image();
birdImage.src = 'https://i.postimg.cc/ZWZwFNPK/netanyahu.png'; // رابط الصورة المباشر

let birdY = canvas.height / 2;
let gravity = 0.3;
let birdVelocity = 0;
let columns = [];
let gameStarted = false;
let score = 0;
let microphoneStream = null;

function drawBird() {
    ctx.drawImage(birdImage, 30, birdY, 60, 60); // تكبير الصورة إلى 60x60
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
        if (60 + 30 > column.x && 30 - 30 < column.x + 50) {
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
    alert('Game Over! Your Score: ' + score);
    restartBtn.classList.remove('hidden'); // إظهار زر إعادة التشغيل
    gameStarted = false;
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

    if (!microphoneStream) { // طلب إذن الميكروفون مرة واحدة فقط
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function(stream) {
                microphoneStream = stream; // حفظ الوصول إلى الميكروفون
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const microphone = audioContext.createMediaStreamSource(stream);
                const analyser = audioContext.createAnalyser();
                microphone.connect(analyser);
                analyser.fftSize = 512;

                const dataArray = new Uint8Array(analyser.frequencyBinCount);

                function checkVolume() {
                    if (!gameStarted) return; // لا حاجة لتحليل الصوت إذا كانت اللعبة متوقفة
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
    }

    restartBtn.classList.add('hidden'); // إخفاء زر إعادة التشغيل عند بدء اللعبة
    gameLoop();
}

// إعادة تشغيل اللعبة عند النقر على زر إعادة التشغيل
restartBtn.addEventListener('click', startGame);

// بدء اللعبة عند تحميل الصفحة
startGame();
