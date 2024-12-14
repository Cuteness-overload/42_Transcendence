import {speed, size} from './play-menu.js';

const API_BASE_URL = "/users";


export function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


export async function startGame4P(){

    const authenticated = await router.isAuthenticated();
    if (!authenticated) {
        alert('Votre session a expiré. Veuillez vous reconnecter.');
        window.location.hash = '#/login';
        return;
    }

    fetch(`${API_BASE_URL}/profile/`, {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                alert('response startgame2p: Votre session a expiré. Veuillez vous reconnecter.');
                window.location.hash = '#/login';
            }
            throw new Error(`Erreur HTTP! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (J1) {
            J1 = data.username;
        } else {
            console.error("Élément 'username-display' introuvable.");
        }
    })
    .catch(error => {
        console.error('Erreur lors du chargement du profil :', error);
        showMessage('Erreur lors du chargement du profil.', 'error');
    });

    function showMessage(message, type) {
        let messageDiv = document.getElementById('message');
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.id = 'message';
            // document.querySelector('.play-page').prepend(messageDiv);
        }
        messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
        messageDiv.textContent = message;
    }


    const lang = i18next.language;
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    let J1 = "J1";
    let j1score = 0;
    let J2 = "J2";
    let j2score = 0;
    let J3 = "J3";
    let j3score = 0;
    let J4 = "J4";
    let j4score = 0;


    // Event listeners for paddle movement
    document.addEventListener('keydown', (e) => {
        // Left paddle (W and S)
        if (e.key === 'w' || e.key === 'W') leftPaddleMovingUp = true;
        if (e.key === 's' || e.key === 'S') leftPaddleMovingDown = true;

        //top paddle
        if (e.key === 'c' || e.key === 'C') topPaddleMovingRight = true;
        if (e.key === 'v' || e.key === 'V') topPaddleMovingLeft = true;

        //bottom paddle
        if (e.key === 'n' || e.key === 'N') bottomPaddleMovingRight = true;
        if (e.key === 'm' || e.key === 'M') bottomPaddleMovingLeft = true;

        // Right paddle (Arrow Up and Arrow Down)
        if (e.key === 'ArrowUp'){
            e.preventDefault();
            rightPaddleMovingUp = true;
        }
        if (e.key === 'ArrowDown'){
            e.preventDefault();
            rightPaddleMovingDown = true;
        }
        if (e.key === 'ArrowLeft')
            e.preventDefault();
        if (e.key === 'ArrowRight')
            e.preventDefault();
    });

    document.addEventListener('keyup', (e) => {
        // Left paddle
        if (e.key === 'w' || e.key === 'W') leftPaddleMovingUp = false;
        if (e.key === 's' || e.key === 'S') leftPaddleMovingDown = false;

        //top paddle
        if (e.key === 'c' || e.key === 'C') topPaddleMovingRight = false;
        if (e.key === 'v' || e.key === 'V') topPaddleMovingLeft = false;

        //bottom paddle
        if (e.key === 'n' || e.key === 'N') bottomPaddleMovingRight = false;
        if (e.key === 'm' || e.key === 'M') bottomPaddleMovingLeft = false;

        // Right paddle
        if (e.key === 'ArrowUp'){
            e.preventDefault();
            rightPaddleMovingUp = false;
        }
        if (e.key === 'ArrowDown'){
            e.preventDefault();
            rightPaddleMovingDown = false;
        }
    });

    // Ball properties
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballRadius = 15;
    let speedX = 5 * speed;
    let speedY = 5 * speed;
    let ballSpeedX = Math.random() > 0.5 ? speedX : -speedX;
    let ballSpeedY = Math.random() > 0.5 ? speedY : -speedY;

    function DrawBall(){

        ctx.beginPath();
        ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();
    }

    // Paddle properties
    const paddleWidth = 20;
    const paddleHeight = 200 * size;
    const topPaddleWidth = 200 * size;
    const topPaddleHeight = 20;
    const paddleSpeed = 8;
    const paddleOffset = 8;

    // Left paddle
    let leftPaddleY = canvas.height / 2 - paddleHeight / 2;
    let leftPaddleMovingUp = false;
    let leftPaddleMovingDown = false;

    // Right paddle
    let rightPaddleY = canvas.height / 2 - paddleHeight / 2;
    let rightPaddleMovingUp = false;
    let rightPaddleMovingDown = false;

    // Top paddle
    let topPaddleX = canvas.width / 2 - topPaddleWidth / 2;
    let topPaddleMovingLeft = false;
    let topPaddleMovingRight = false;

    // bottom paddle
    let bottomPaddleX = canvas.width / 2 - topPaddleWidth / 2;
    let bottomPaddleMovingLeft = false;
    let bottomPaddleMovingRight = false;

    function DrawPaddles(){

        ctx.fillStyle = "#ff0000";
        ctx.fillRect(paddleOffset, leftPaddleY, paddleWidth, paddleHeight);

        ctx.fillStyle = "#0000ff";
        ctx.fillRect(canvas.width - paddleWidth - paddleOffset, rightPaddleY, paddleWidth, paddleHeight);

        ctx.fillStyle = "#00ff00";
        ctx.fillRect(topPaddleX, paddleOffset, topPaddleWidth, topPaddleHeight);

        ctx.fillStyle = "#ffff00";
        ctx.fillRect(bottomPaddleX, canvas.height - topPaddleHeight - paddleOffset, topPaddleWidth, topPaddleHeight);
    }
    async function stopBall(){
        ballSpeedX = 0;
        ballSpeedY = 0;
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        await wait(1000);
        setBall();
    }

    function setBall(){
        ballSpeedY = Math.random() > 0.5 ? speedY : -speedY;
        ballSpeedX = Math.random() > 0.5 ? speedX : -speedX;
    }

    stopBall();
            // Game loop
    function drawGame() {

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        DrawBall();
        DrawPaddles();
        // ctx.fillRect(canvas.width - paddleWidth - paddleOffset, rightPaddleY, paddleWidth, paddleHeight);

        // Move the left paddle
        if (leftPaddleMovingUp && leftPaddleY > 0) {
            leftPaddleY -= paddleSpeed;
        }
        if (leftPaddleMovingDown && leftPaddleY < canvas.height - paddleHeight) {
            leftPaddleY += paddleSpeed;
        }

        // Move the right paddle
        if (rightPaddleMovingUp && rightPaddleY > 0) {
            rightPaddleY -= paddleSpeed;
        }
        if (rightPaddleMovingDown && rightPaddleY < canvas.height - paddleHeight) {
            rightPaddleY += paddleSpeed;
        }

        // Move the top paddle
        if (topPaddleMovingRight && topPaddleX > 0) {
            topPaddleX -= paddleSpeed;
        }if (topPaddleMovingLeft && topPaddleX < canvas.width - topPaddleWidth) {
            topPaddleX += paddleSpeed;
        }

        // Move the bottom paddle
        if (bottomPaddleMovingRight && bottomPaddleX > 0) {
            bottomPaddleX -= paddleSpeed;
        }if (bottomPaddleMovingLeft && bottomPaddleX < canvas.width - topPaddleWidth) {
            bottomPaddleX += paddleSpeed;
        }

        // Move the ball
        ballX += ballSpeedX + Math.random() - 0.5;
        ballY += ballSpeedY + Math.random() - 0.5;

        // Bounce the ball off the top paddle
        if (ballY - ballRadius <= topPaddleHeight + paddleOffset &&
            ballX > topPaddleX &&
            ballX < topPaddleX + topPaddleWidth &&
            ballSpeedY < 0
        ) {
            ballSpeedY = -ballSpeedY + 0.2;
            ballY = topPaddleHeight + ballRadius;
        }

        // Bounce the ball off the bottom paddle
        if (ballY + ballRadius >= canvas.height - topPaddleHeight - paddleOffset &&
            ballX > bottomPaddleX &&
            ballX < bottomPaddleX + topPaddleWidth &&
            ballSpeedY > 0
        ) {
            ballSpeedY = -ballSpeedY + 0.2;
            ballY = canvas.height - paddleOffset - topPaddleHeight;
        }


        // Bounce the ball off the left paddle
        if (
            ballX - ballRadius <= paddleWidth + paddleOffset &&
            ballY > leftPaddleY &&
            ballY < leftPaddleY + paddleHeight &&
            ballSpeedX < 0
        ) {
            ballSpeedX = -ballSpeedX + 0.2;
            ballX = paddleWidth + ballRadius;
        }

        // Bounce the ball off the right paddle
        if (
            ballX + ballRadius >= canvas.width - paddleWidth - paddleOffset &&
            ballY > rightPaddleY &&
            ballY < rightPaddleY + paddleHeight &&
            ballSpeedX > 0
        ) {
            ballSpeedX = -ballSpeedX - 0.2;
            ballX = canvas.width - paddleWidth - ballRadius;
        }

        if (ballX + ballRadius >= canvas.width) {
            j1score += 1;
            stopBall();
        }
        if (ballX - ballRadius <= 0) {
            j2score += 1;
            stopBall();
        }
        if (ballY + ballRadius >= canvas.height) {
            j3score += 1;
            stopBall();
        }
        if (ballY - ballRadius <= 0) {
            j4score += 1;
            stopBall();
        }

        updateScores(j1score, j2score);

        // Repeat the game loop until game is over
        if (j1score >= 5 || j2score >= 5 || j3score >=5 || j4score >= 5){
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            stopBall();
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(canvas.width / 2 - 312, canvas.height / 2 - 112, 624, 224);
            ctx.fillStyle = "#000000";
            ctx.fillRect(canvas.width / 2 - 300, canvas.height / 2 - 100, 600, 200);
            ctx.font = "18px 'Audiowide'";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            let line = lang === 'fr' ? `Felicitations ! Le gagnant est ` 
                                    : lang === 'en' ? `Congratulations! Winner is `
                                    : `Felicitaciones! El ganador es `;
            if (j1score >= 5)
                line += J1;
            if (j2score >= 5)
                line += J2;
            if (j3score >= 5)
                line += J3;
            if (j4score >= 5)
                line += J4;
            line += '!';
            ctx.fillText(line, canvas.width / 2, canvas.height / 2);
        }
        else {
            requestAnimationFrame(drawGame);
        }
}


    function updateScores() {
        const scorej1 = document.getElementById("j1score-disp")
        const scorej2 = document.getElementById("j2score-disp")
        const scorej3 = document.getElementById("j3score-disp")
        const scorej4 = document.getElementById("j4score-disp")
        if (scorej1){
            scorej1.textContent = `J1:${j1score}`;
        }
        if (scorej2){
            scorej2.textContent = `J2:${j2score}`;
        }
        if (scorej3){
            scorej3.textContent = `J3:${j3score}`;
        }
        if (scorej4){
            scorej4.textContent = `J4:${j4score}`;
        }
    };
    // Start the game loop
    drawGame();
};
