import {speed, size, players} from './play-menu.js';

const API_BASE_URL = "/users";

export function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const tournamentState = {
    isTournamentActive: false
};

let winners = [];

export async function startGameTournament(){
    tournamentState.isTournamentActive = true;

    if (players.length !== 4)
        return ;
    match(players[0], players[1]);
}


async function match(J1, J2){

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
                window.location.hash = '#/login';
            }
            throw new Error(`Erreur HTTP! status: ${response.status}`);
        }
        return response.json();
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

    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');

    if (!canvas || !ctx) {
        return;
    }

    let j1score = 0;
    let j2score = 0;
    const WinningScore = 5;

    // Event listeners for paddle movement
    document.addEventListener('keydown', (e) => {
        // Left paddle (W and S)
        if (e.key === 'w' || e.key === 'W') leftPaddleMovingUp = true;
        if (e.key === 's' || e.key === 'S') leftPaddleMovingDown = true;

        // Right paddle (Arrow Up and Arrow Down)
        if (e.key === 'ArrowUp'){
            e.preventDefault();
            rightPaddleMovingUp = true;
        }
        if (e.key === 'ArrowDown'){
            e.preventDefault();
            rightPaddleMovingDown = true;
        }
    });

    document.addEventListener('keyup', (e) => {
        // Left paddle
        if (e.key === 'w' || e.key === 'W') leftPaddleMovingUp = false;
        if (e.key === 's' || e.key === 'S') leftPaddleMovingDown = false;

        // Right paddle
        if (e.key === 'ArrowUp'){
            e.preventDefault();
            rightPaddleMovingUp = false;
        }
        if (e.key === 'ArrowDown'){
            e.preventDefault();
            rightPaddleMovingDown = false;
        }
        if (e.key === 'ArrowLeft')
            e.preventDefault();
        if (e.key === 'ArrowRight')
            e.preventDefault();
    });

    if (winners.length === 0) {
        // printMatches();
        // wait(3000);
        const lang = i18next.language;
        const lines = [];
        lines.push('');
        if (lang === "en") {
            lines.push(`Match 1: ${players[0]} vs ${players[1]}`);
            lines.push('');
            lines.push(`Match 2: ${players[2]} vs ${players[3]}`);
            lines.push('');
            lines.push(`Match 3: Winner match 1 vs Winner match 2`);
        } else if (lang === "fr") {
            lines.push(`Match 1: ${players[0]} contre ${players[1]}`);
            lines.push('');
            lines.push(`Match 2: ${players[2]} contre ${players[3]}`);
            lines.push('');
            lines.push(`Match 3: Gagnant match 1 vs Gagnant match 2`);
        } else if (lang === "es") {
            lines.push(`Partido 1: ${players[0]} vs ${players[1]}`);
            lines.push('');
            lines.push(`Partido 2: ${players[2]} vs ${players[3]}`);
            lines.push('');
            lines.push(`Partido 3: Ganador del partido 1 vs Ganador del partido 2`);
        }
        // alert(lines.join('\n'));

        const x = canvas.width / 2;
        const startY = canvas.height / 2 - (lines.length / 2) * 30;
        const lineHeight = 30;

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "18px 'Audiowide'";
        ctx.fillStyle = "white";

        lines.forEach((line, i) => {
            ctx.fillText(line, x, startY + i * lineHeight);
        });
        await wait(4000);
    }

    // Ball properties
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballRadius = 15;
    let speedX = 7 * speed;
    let speedY = 4;
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
    const paddleHeight = 200 * size;
    const paddleWidth = 20;
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

    function DrawPaddles(){

        ctx.fillStyle = "#ff0000";
        ctx.fillRect(paddleOffset, leftPaddleY, paddleWidth, paddleHeight);

        ctx.fillStyle = "#0000ff";
        ctx.fillRect(canvas.width - paddleWidth - paddleOffset, rightPaddleY, paddleWidth, paddleHeight);
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
    async function drawGame() {

        if (!tournamentState.isTournamentActive){
            return ;
        }

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        DrawBall();
        DrawPaddles();

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

        // Move the ball
        ballX += ballSpeedX;
        ballY += ballSpeedY +  2 * Math.random() * ballSpeedY;

        // Bounce the ball off the top and bottom edges
        if (ballY + ballRadius >= canvas.height && ballSpeedY > 0){
            ballSpeedY *= -1;
        }
        if (ballY - ballRadius <= 0 && ballSpeedY < 0){
            ballSpeedY *= -1;
        }

        // Bounce the ball off the left paddle
        if (
            ballX - ballRadius <= paddleWidth + paddleOffset && // Ball reaches left paddle
            ballY > leftPaddleY &&                              // Ball is within left paddle's top edge
            ballY < leftPaddleY + paddleHeight &&               // Ball is within left paddle's bottom edge
            ballSpeedX < 0
        ) {
            ballSpeedX = -ballSpeedX + 0.2; // Reverse horizontal direction
            ballX = paddleWidth + ballRadius; // Prevent clipping into the paddle
        }

        // Bounce the ball off the right paddle
        if (
            ballX + ballRadius >= canvas.width - paddleWidth - paddleOffset && // Ball reaches right paddle
            ballY > rightPaddleY &&                           // Ball is within right paddle's top edge
            ballY < rightPaddleY + paddleHeight &&              // Ball is within right paddle's bottom edge
            ballSpeedX > 0
        ) {
            ballSpeedX = -ballSpeedX - 0.2; // Reverse horizontal direction
            ballX = canvas.width - paddleWidth - ballRadius; // Prevent clipping into the paddle
        }

        if (ballX - ballRadius < 0) {
            j2score += 1;
            stopBall();
        }
        if (ballX + ballRadius > canvas.width) {
            j1score += 1;
            stopBall();
        }

        updateScores();

        // Repeat the game loop until game is over
        if (j1score >= WinningScore || j2score >= WinningScore){
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
            if (j1score >= WinningScore && winners.length !== 3){
                // ctx.fillText(`Congratulations ! Winner is ${J1} !`, canvas.width / 2, canvas.height / 2);
                winners.push(J1);
                printWinner(J1);
            }
            else if (j2score >= WinningScore && winners.length !== 3){
                // ctx.fillText(`Congratulations ! Winner is ${J2} !`, canvas.width / 2, canvas.height / 2);
                winners.push(J2);
                printWinner(J2);
            } else {
                drawScreen(j1score >= WinningScore ? J2 : J1);
            }
            return ;
        } else {
            requestAnimationFrame(drawGame);
        }
    }

    function updateScores() {
        const scorej1 = document.getElementById("j1score-disp")
        const scorej2 = document.getElementById("j2score-disp")
        if (scorej1){
            scorej1.textContent = `${J1}:${j1score}`;
        }
        if (scorej2){
            scorej2.textContent = `${J2}:${j2score}`;
        }
    };

    function printWinner(name) {
        let countdown = 5;

        function drawScreen(name) {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

            // Draw the rectangle
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(canvas.width / 2 - 312, canvas.height / 2 - 112, 624, 224);
            ctx.fillStyle = "#000000";
            ctx.fillRect(canvas.width / 2 - 300, canvas.height / 2 - 100, 600, 200);

            // Set up text
            const lang = i18next.language;
            let lines = [];
            if (lang === "en") {
                    lines = [
                    `Congratulations! Winner is ${name}!`,
                    "",
                    winners.length === 2
                        ? `Next match: ${winners[0]} vs ${winners[1]}`
                        : winners.length === 3
                            ? ""
                            : `Next match: ${players[2]} vs ${players[3]}`,
                    "",
                    winners.length !== 3
                        ? `Starting in ${countdown} seconds...`
                        : "Tournament is over!"];
                } else if (lang === "fr") {
                    lines = [
                        `Felicitations ! Le gagnant est ${name}!`,
                        "",
                        winners.length === 2
                            ? `Prochain match: ${winners[0]} vs ${winners[1]}`
                            : winners.length === 3
                                ? ""
                                : `Prochain match: ${players[2]} vs ${players[3]}`,
                        "",
                        winners.length !== 3
                            ? `Starting in ${countdown} seconds...`
                            : "Fin du tournois!"];
                    }  else if (lang === "es") {
                        lines = [
                            `Felicitaciones ! el ganador es ${name}!`,
                            "",
                            winners.length === 2
                                ? `próximo partido: ${winners[0]} vs ${winners[1]}`
                                : winners.length === 3
                                    ? ""
                                    : `próximo partido: ${players[2]} vs ${players[3]}`,
                            "",
                            winners.length !== 3
                                ? `empezar en ${countdown} segundos...`
                                : "el torneo ha terminado!"];
                    }
            const x = canvas.width / 2;
            const lineHeight = 20;
            const startY = canvas.height / 2 - (lines.length / 2) * lineHeight;

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "18px 'Audiowide'";
            ctx.fillStyle = "white";

            lines.forEach((line, i) => {
                ctx.fillText(line, x, startY + i * lineHeight);
            });
        }

        const interval = setInterval(() => {
            drawScreen(name);
            countdown--;

            if (countdown < 0) {
                clearInterval(interval);
                if (winners.length === 2) {
                    match(winners[0], winners[1]);
                } else if (winners.length === 1) {
                    match(players[2], players[3]);
                }
            }
        }, 1000);

        drawScreen(name);
    }


    async function printMatches(){
        const lang = i18next.language;
        const lines = [];
        if (lang === "en") {
            lines.push(`Match 1: ${players[0]} vs ${players[1]}`);
            lines.push('');
            lines.push(`Match 2: ${players[2]} vs ${players[3]}`);
        } else if (lang === "fr") {
            lines.push(`Match 1: ${players[0]} contre ${players[1]}`);
            lines.push('');
            lines.push(`Match 2: ${players[2]} contre ${players[3]}`);
        } else if (lang === "es") {
            lines.push(`Partido 1: ${players[0]} vs ${players[1]}`);
            lines.push('');
            lines.push(`Partido 2: ${players[2]} vs ${players[3]}`);
        }

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(canvas.width / 2 - 312, canvas.height / 2 - 112, 624, 224);
        ctx.fillStyle = "#000000";
        ctx.fillRect(canvas.width / 2 - 300, canvas.height / 2 - 100, 600, 200);

        const x = canvas.width / 2;
        const startY = canvas.height / 2 - (lines.length / 2) * 30;
        const lineHeight = 30;

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "18px 'Audiowide'";
        ctx.fillStyle = "white";

        lines.forEach((line, i) => {
            ctx.fillText(line, x, startY + i * lineHeight);
        });
    }

    // Start the game loop
    drawGame();
}
