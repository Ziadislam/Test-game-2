const player = document.getElementById('player');
const obstacle = document.getElementById('obstacle');
const scoreDisplay = document.getElementById('score');
const startScreen = document.getElementById('start-screen');
const road = document.querySelector('.road');
const gameContainer = document.getElementById('game-container');

const gameSound = document.getElementById('gameSound');
const jumpSound = document.getElementById('jumpSound');
const hitSound = document.getElementById('hitSound');

let isJumping = false;
let score = 0;
let gameIsRunning = false;
let currentLevel = 1;

const lanes = ['lane-left', 'lane-center', 'lane-right'];
let currentLaneIndex = 1;

let obstacleTop = -50;
let obstacleLaneIndex = 1;
let obstacleSpeed = 7; // السرعة الابتدائية

function startGame() {
    startScreen.style.display = 'none';
    gameIsRunning = true;
    player.classList.add('is-running');
    road.style.animationPlayState = 'running';

    if (gameSound) {
        gameSound.volume = 0.5;
        gameSound.play().catch(e => {});
        gameSound.addEventListener('ended', function() {
            this.currentTime = 0;
            this.play();
        }, false);
    }

    startObstacleLoop();
}

function moveLane(direction) {
    if (!gameIsRunning) return;
    
    if (direction === 'left' && currentLaneIndex > 0) {
        currentLaneIndex--;
    } else if (direction === 'right' && currentLaneIndex < 2) {
        currentLaneIndex++;
    }
    
    player.className = lanes[currentLaneIndex] + " is-running";
}

function jump() {
    if (!gameIsRunning || isJumping) return;
    isJumping = true;
    
    if (jumpSound) {
        jumpSound.currentTime = 0;
        jumpSound.play().catch(e => {});
    }

    let jumpHeight = 0;
    let upInterval = setInterval(() => {
        if (jumpHeight >= 110) {
            clearInterval(upInterval);
            let downInterval = setInterval(() => {
                if (jumpHeight <= 0) {
                    clearInterval(downInterval);
                    isJumping = false;
                }
                jumpHeight -= 12;
                player.style.bottom = (40 + jumpHeight) + 'px';
            }, 20);
        }
        jumpHeight += 12;
        player.style.bottom = (40 + jumpHeight) + 'px';
    }, 20);
}

function startObstacleLoop() {
    let obsInterval = setInterval(() => {
        if (!gameIsRunning) return;

        // تحريك العائق بالسرعة الحالية
        obstacleTop += obstacleSpeed;
        obstacle.style.top = obstacleTop + 'px';

        // لو العائق عدى من تحت
        if (obstacleTop > 400) {
            obstacleTop = -50;
            
            // اختيار حارة بشكل عشوائي تام
            obstacleLaneIndex = Math.floor(Math.random() * 3);
            obstacle.className = lanes[obstacleLaneIndex];
            
            score += 10;
            scoreDisplay.innerText = "النقاط: " + score;

            // 1. زيادة السرعة تدريجياً مع كل نقطة
            obstacleSpeed = 7 + Math.floor(score / 50); 
            road.style.animationDuration = Math.max(0.15, 0.5 - (score * 0.001)) + 's';

            // 2. شرط الانتقال للماب الثانية عند 200 نقطة
            if (score >= 200 && currentLevel === 1) {
                currentLevel = 2;
                gameIsRunning = false;
                road.style.animationPlayState = 'paused';
                if (gameSound) gameSound.pause();

                // تغيير مظهر الماب الثانية (لون سماء مختلف + عوائق أسرع وأصعب)
                gameContainer.style.background = "linear-gradient(to bottom, #4a0e4e, #8e44ad)";
                obstacle.style.backgroundColor = "#f1c40f"; // تغيير لون العائق

                alert("🎉 وحش! خلصت المستوى الأول ودخلت الماب التانية (Lava World) السرعة هتزيد!");
                
                gameIsRunning = true;
                road.style.animationPlayState = 'running';
                if (gameSound) gameSound.play();
            }
        }

        // كشف الاصطدام
        let playerBottom = parseInt(window.getComputedStyle(player).bottom);
        if (obstacleTop > 280 && obstacleTop < 360 && currentLaneIndex === obstacleLaneIndex && playerBottom < 85) {
            if (hitSound) {
                hitSound.currentTime = 0;
                hitSound.play().catch(e => {});
            }
            
            gameIsRunning = false;
            road.style.animationPlayState = 'paused';
            if (gameSound) gameSound.pause();
            
            alert("إوبا! خبطت في العائق. نتيجتك النهائية: " + score);
            location.reload(); 
        }
    }, 30);
}

function toggleSound() {
    if (gameSound) {
        gameSound.muted = !gameSound.muted;
        if(jumpSound) jumpSound.muted = gameSound.muted;
        if(hitSound) hitSound.muted = gameSound.muted;
    }
}

function changeVolume(val) {
    if (gameSound) {
        gameSound.volume = val;
        if(jumpSound) jumpSound.volume = val;
        if(hitSound) hitSound.volume = val;
    }
}