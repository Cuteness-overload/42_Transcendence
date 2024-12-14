import {speed, size, mapMode} from './play-menu.js';

const API_BASE_URL = "/users";

export function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


export async function postGameHistory(opponent, score, result, date) {
    try {
        const response = await fetch(`${API_BASE_URL}/game-history/`, {
            method: 'POST',
            credentials: 'include',  // Cela envoie les cookies d'authentification si nécessaire
            headers: {
                'Content-Type': 'application/json',  // Déclare le type de contenu envoyé
            },
            body: JSON.stringify({
                opponent: opponent,
                score: score,
                result: result,
                date: date
            }),
        });

        if (!response.ok) {
            // Si la réponse n'est pas OK, récupérer le texte d'erreur renvoyé par le serveur
            const errorMessage = await response.text();
            console.error("Erreur API : ", errorMessage);
            throw new Error('Erreur lors de l\'envoi de l\'historique de jeu');
        }

        // Si la réponse est OK, analyser la réponse JSON
        const data = await response.json();

        return data;  // Retourne les données reçues du serveur

    } catch (error) {
        console.error("Erreur lors de l\'appel API : ", error);
        throw error;  // Rethrow l'erreur pour la propager à l'appelant
    }
}



export async function startGame2P(){
    let J1 = "J1";
    let J2 = "J2";
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

    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const scoreDiv = document.getElementById('j1score-disp');
    let j1score = 0;
    let j2score = 0;
    
    canvas.width = 800;
    canvas.height = 600;

    
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
    
    let ballstartX = canvas.width / 2;
    let ballstartY = canvas.height / 2;
    if (mapMode === 2) {
        ballstartY -= 100;
    }
    // Ball properties
    let ballX = ballstartX;
    let ballY = ballstartY;
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
    const paddleWidth = 20;
    const paddleHeight = 200 * size;
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
        ballX = ballstartX;
        ballY = ballstartY;
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

        // drawObstacle();
        
        drawObstacle();
        // if (mapMode === 1) {
        //     const obstacleX1 = (canvas.width / 2) - 5;
        //     const obstacleX2 = (canvas.width / 2) + 5;
        //     const obstacleGapTop = (canvas.height / 2) - 80;
        //     const obstacleGapBottom = (canvas.height / 2) + 80;
            
        //     // Check collision with the left side of the obstacles
        //     if (
        //         ballX + ballRadius >= obstacleX1 &&
        //         ballX < obstacleX2 && // Ensure ball is between the two vertical edges
        //         (ballY < obstacleGapTop || ballY > obstacleGapBottom) // Ball is not in the gap
        //     ) {
        //         ballSpeedX *= -1; // Reverse horizontal direction
        //         ballX = obstacleX1 - ballRadius; // Adjust ball position to prevent overlap
        //     }
            
        //     // Check collision with the right side of the obstacles
        //     if (
        //         ballX - ballRadius <= obstacleX2 &&
        //         ballX > obstacleX1 &&
        //         (ballY < obstacleGapTop || ballY > obstacleGapBottom)
        //     ) {
        //         ballSpeedX *= -1; // Reverse horizontal direction
        //         ballX = obstacleX2 + ballRadius; // Adjust ball position to prevent overlap
        //     }
        // } else if (mapMode === 2) {
            // }
        checkObstacleCollision();
        
        
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
        // Modify the game over section
        if (j1score >= 5 || j2score >= 5) {
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

            const lang = i18next.language;
            let line = lang === 'fr' ? `Felicitations ! Le gagnant est ` 
                                        : lang === 'en' ? `Congratulations! Winner is `
                                        : `Felicitaciones! El ganador es `;
            line += j1score >= 5 ? J1 : J2;
            line += '!';
            ctx.fillText(line, canvas.width / 2, canvas.height / 2);
      
            // MATCH HISTORY
            function formatDate(date) {
                const year = date.getFullYear();
                const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Mois entre 01 et 12
                const day = date.getDate().toString().padStart(2, '0'); // Jour entre 01 et 31
                const hours = date.getHours().toString().padStart(2, '0'); // Heure entre 00 et 23
                const minutes = date.getMinutes().toString().padStart(2, '0'); // Minutes entre 00 et 59
                
                return `${year}-${month}-${day} ${hours}:${minutes}`;
            }

            // Call postGameHistory with the appropriate arguments
            const date = formatDate(new Date());  // Utilisation de la fonction de formatage de date
            const score = `${j1score}-${j2score}`;
            const result = j1score > j2score ? 'Win' : 'Loss';
     

            postGameHistory("2 Joueurs", score, result, date)  // Send the game history
                .catch(error => {
                    console.error("Erreur lors de l'enregistrement de l'historique :", error);
                });
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
    // Start the game loop
    drawGame();



    function drawObstacle() {
        const canvas = document.getElementById('game-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                if (mapMode === 1) {
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect((canvas.width / 2) - 5, 0, 10, (canvas.height / 2) - 80);
                    ctx.fillRect((canvas.width / 2) - 5, (canvas.height / 2) + 80, 10, (canvas.height / 2) - 80);
                } else if (mapMode === 2) {
                    const rectWidth = 15; // Width of the rectangle
                    const rectHeight = 120; // Height of the rectangle
                    const spacing = 150; // Spacing between the rectangles
                    const centerX = canvas.width / 2;
                    const centerY = canvas.height / 2;

                    const rectangles = [
                        { x: centerX - spacing - rectWidth / 2, y: centerY - spacing - rectHeight / 2 }, // Top-left
                        { x: centerX + spacing - rectWidth / 2, y: centerY - spacing - rectHeight / 2 }, // Top-right
                        { x: centerX - rectWidth / 2, y: centerY - rectHeight / 2 }, // Center
                        { x: centerX - spacing - rectWidth / 2, y: centerY + spacing - rectHeight / 2 }, // Bottom-left
                        { x: centerX + spacing - rectWidth / 2, y: centerY + spacing - rectHeight / 2 }, // Bottom-right
                    ];

                    ctx.fillStyle = "#ffffff";
                    for (const rect of rectangles) {
                        ctx.fillRect(rect.x, rect.y, rectWidth, rectHeight);
                    }
                }
            }
        }
    }
    
    function checkObstacleCollision() {
        if (mapMode === 1) {
            const obstacleX1 = (canvas.width / 2) - 5;
            const obstacleX2 = (canvas.width / 2) + 5;
            const obstacleGapTop = (canvas.height / 2) - 80;
            const obstacleGapBottom = (canvas.height / 2) + 80;
            
            // Check collision with the left side of the obstacles
            if (
                ballX + ballRadius >= obstacleX1 &&
                ballX < obstacleX2 && // Ensure ball is between the two vertical edges
                (ballY < obstacleGapTop || ballY > obstacleGapBottom) // Ball is not in the gap
            ) {
                ballSpeedX *= -1; // Reverse horizontal direction
                ballX = obstacleX1 - ballRadius; // Adjust ball position to prevent overlap
            }
            
            // Check collision with the right side of the obstacles
            if (
                ballX - ballRadius <= obstacleX2 &&
                ballX > obstacleX1 &&
                (ballY < obstacleGapTop || ballY > obstacleGapBottom)
            ) {
                ballSpeedX *= -1; // Reverse horizontal direction
                ballX = obstacleX2 + ballRadius; // Adjust ball position to prevent overlap
            }
        } else if (mapMode === 2) {
            const rectWidth = 30;
            const rectHeight = 80;
            const spacing = 150;
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            const rectangles = [
                { x: centerX - spacing - rectWidth / 2, y: centerY - spacing - rectHeight / 2 }, // Top-left
                { x: centerX + spacing - rectWidth / 2, y: centerY - spacing - rectHeight / 2 }, // Top-right
                { x: centerX - rectWidth / 2, y: centerY - rectHeight / 2 }, // Center
                { x: centerX - spacing - rectWidth / 2, y: centerY + spacing - rectHeight / 2 }, // Bottom-left
                { x: centerX + spacing - rectWidth / 2, y: centerY + spacing - rectHeight / 2 }, // Bottom-right
            ];

            for (const rect of rectangles) {
                if (
                    ballX + ballRadius > rect.x &&
                    ballX - ballRadius < rect.x + rectWidth &&
                    ballY + ballRadius > rect.y &&
                    ballY - ballRadius < rect.y + rectHeight
                ) {
                    // Determine overlap to adjust position
                    const overlapLeft = ballX + ballRadius - rect.x;
                    const overlapRight = rect.x + rectWidth - (ballX - ballRadius);
                    const overlapTop = ballY + ballRadius - rect.y;
                    const overlapBottom = rect.y + rectHeight - (ballY - ballRadius);

                    // Identify the smallest overlap to determine the collision side
                    const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

                    if (minOverlap === overlapLeft) {
                        // Collision on the left
                        ballX = rect.x - ballRadius;
                        ballSpeedX *= -1;
                    } else if (minOverlap === overlapRight) {
                        // Collision on the right
                        ballX = rect.x + rectWidth + ballRadius;
                        ballSpeedX *= -1;
                    } else if (minOverlap === overlapTop) {
                        // Collision on the top
                        ballY = rect.y - ballRadius;
                        ballSpeedY *= -1;
                    } else if (minOverlap === overlapBottom) {
                        // Collision on the bottom
                        ballY = rect.y + rectHeight + ballRadius;
                        ballSpeedY *= -1;
                    }

                    break;
                }
            }
        }
    }
}

