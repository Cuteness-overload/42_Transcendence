// /asset/js/play-solo.js

import { speed, size } from './play-menu.js';
import { router } from './router.js'; // Assurez-vous que router est correctement importé

export function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const API_BASE_URL = "/users";

// Fonction pour envoyer l'historique du jeu
export async function postGameHistory(opponent, score, result, date) {
    try {
        const response = await fetch(`${API_BASE_URL}/game-history/`, {
            method: 'POST',
            credentials: 'include',  // Envoie les cookies d'authentification si nécessaire
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
            const errorMessage = await response.text();
            console.error("Erreur API : ", errorMessage);
            throw new Error('Erreur lors de l\'envoi de l\'historique de jeu');
        }

        const data = await response.json();
        return data;  // Retourne les données reçues du serveur

    } catch (error) {
        console.error("Erreur lors de l'appel API : ", error);
        throw error;  // Relance l'erreur pour la propager à l'appelant
    }
}

export async function startGameSolo() {
    let J1 = "J1";
    const authenticated = await router.isAuthenticated();
    if (!authenticated) {
        alert('Votre session a expiré. Veuillez vous reconnecter.');
        window.location.hash = '#/login';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/profile/`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert('response startgame2p: Votre session a expiré. Veuillez vous reconnecter.');
                window.location.hash = '#/login';
            }
            throw new Error(`Erreur HTTP! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.username) {
            J1 = data.username;
        } else {
            console.error("Élément 'username-display' introuvable.");
        }
    } catch (error) {
        console.error('Erreur lors du chargement du profil :', error);
        showMessage('Erreur lors du chargement du profil.', 'error');
    }

    function showMessage(message, type) {
        let messageDiv = document.getElementById('message');
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.id = 'message';
            // Vous pouvez décommenter la ligne suivante si vous souhaitez afficher le message dans un conteneur spécifique
            // document.querySelector('.play-page').prepend(messageDiv);
        }
        messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
        messageDiv.textContent = message;
    }

    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    let j1score = 0, j2score = 0;

    // Configuration de l'IA
    const AI_PADDLE_SPEED = 8; // Vitesse de déplacement de l'IA
    const AI_ERROR_CHANCE = 0.15; // 15% de chance que l'IA fasse une erreur
    const AI_OFFSET_RANGE = 30; // Déviation maximale en pixels pour la cible de l'IA

    class Ball {
        constructor(X, Y, speedX, speedY) {
            this.X = X;
            this.Y = Y;
            this.speedX = speedX;
            this.speedY = speedY;
            this.trackingBall = 1;
            this.targetY = canvas.height / 2;
        }

        predictBallLanding() {
            if (this.speedX > 0) { // Ball moving towards AI paddle
                const timeToPaddle = (canvas.width - paddleWidth - paddleOffset - this.X) / this.speedX;
                let predictedY = this.Y + this.speedY * timeToPaddle;

                // Account for bounces off the top and bottom edges
                while (predictedY < 0 || predictedY > canvas.height) {
                    if (predictedY < 0) {
                        predictedY = -predictedY;
                    } else if (predictedY > canvas.height) {
                        predictedY = 2 * canvas.height - predictedY;
                    }
                }

                // Introduire une chance d'erreur pour l'IA
                if (Math.random() < AI_ERROR_CHANCE) {
                    const randomOffset = (Math.random() - 0.5) * AI_OFFSET_RANGE; // Offset entre -AI_OFFSET_RANGE/2 et +AI_OFFSET_RANGE/2
                    this.targetY = Math.max(0, Math.min(predictedY + randomOffset, canvas.height));
                } else {
                    this.targetY = predictedY;
                }
            } else { // Ball moving away from AI paddle
                this.targetY = canvas.height / 2;
            }
        }

        updatePosition(X, Y, speedX, speedY) {
            this.X = X;
            this.Y = Y;
            this.speedX = speedX;
            this.speedY = speedY;
        }

        async startUpdating() {
            while (this.trackingBall === 1) {
                this.updatePosition(ballX, ballY, ballSpeedX, ballSpeedY);
                this.predictBallLanding();
                await wait(1000);
            }
        }
    }

    // Gestion des événements clavier pour le joueur
    document.addEventListener('keydown', (e) => {
        // Left paddle (W and S)
        if (e.key === 'w' || e.key === 'W') leftPaddleMovingUp = true;
        if (e.key === 's' || e.key === 'S') leftPaddleMovingDown = true;

        if (e.key === 'ArrowLeft')
            e.preventDefault();
        if (e.key === 'ArrowRight')
            e.preventDefault();
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === 'w' || e.key === 'W') leftPaddleMovingUp = false;
        if (e.key === 's' || e.key === 'S') leftPaddleMovingDown = false;

        if (e.key === 'ArrowUp')
            e.preventDefault();
        if (e.key === 'ArrowDown')
            e.preventDefault();
    });

    // Gestion des événements clic/touch pour les boutons de contrôle
    const buttonUp = document.getElementById('button-up');
    const buttonDown = document.getElementById('button-down');

    buttonUp.addEventListener('mousedown', () => leftPaddleMovingUp = true);
    buttonUp.addEventListener('mouseup', () => leftPaddleMovingUp = false);
    buttonUp.addEventListener('touchstart', () => leftPaddleMovingUp = true);
    buttonUp.addEventListener('touchend', () => leftPaddleMovingUp = false);

    buttonDown.addEventListener('mousedown', () => leftPaddleMovingDown = true);
    buttonDown.addEventListener('mouseup', () => leftPaddleMovingDown = false);
    buttonDown.addEventListener('touchstart', () => leftPaddleMovingDown = true);
    buttonDown.addEventListener('touchend', () => leftPaddleMovingDown = false);

    // Propriétés de la balle
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballRadius = 15;
    let speedX = 7 * speed;
    let speedY = 4;
    let ballSpeedX = Math.random() > 0.5 ? speedX : -speedX;
    let ballSpeedY = Math.random() > 0.5 ? speedY : -speedY;

    let ball = new Ball(ballX, ballY, ballSpeedX, ballSpeedY);

    function DrawBall() {
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();
    }

    // Propriétés des raquettes
    const paddleWidth = 20;
    const paddleHeight = 200 * size;
    const paddleSpeed = 8;
    const paddleOffset = 8;

    // Raquette gauche (Joueur)
    let leftPaddleY = canvas.height / 2 - paddleHeight / 2;
    let leftPaddleMovingUp = false;
    let leftPaddleMovingDown = false;

    // Raquette droite (IA)
    let rightPaddleY = canvas.height / 2 - paddleHeight / 2;

    function DrawPaddles() {
        // Raquette gauche (Joueur)
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(paddleOffset, leftPaddleY, paddleWidth, paddleHeight);

        // Raquette droite (IA)
        ctx.fillStyle = "#0000ff";
        ctx.fillRect(canvas.width - paddleWidth - paddleOffset, rightPaddleY, paddleWidth, paddleHeight);
    }

    async function stopBall() {
        ballSpeedX = 0;
        ballSpeedY = 0;
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        rightPaddleY = canvas.height / 2 - paddleHeight / 2;
        ball.targetY = canvas.height / 2;
        await wait(1000);
        setBall();

        // Réinitialiser trackingBall et redémarrer la prédiction de l'IA
        ball.trackingBall = 1;
        ball.startUpdating();
    }

    function setBall() {
        ballSpeedY = Math.random() > 0.5 ? speedY : -speedY;
        ballSpeedX = Math.random() > 0.5 ? speedX : -speedX;
    }

    stopBall();

    if (ball) {
        ball.startUpdating();
    }

    // Boucle de jeu
    function drawGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        DrawBall();
        DrawPaddles();

        // Déplacer la raquette gauche (Joueur)
        if (leftPaddleMovingUp && leftPaddleY > 0) {
            leftPaddleY -= paddleSpeed;
        }
        if (leftPaddleMovingDown && leftPaddleY < canvas.height - paddleHeight) {
            leftPaddleY += paddleSpeed;
        }

        // Déplacer la raquette droite (IA)
        if (ball.targetY < rightPaddleY + paddleHeight / 2 - 10) {
            rightPaddleY -= AI_PADDLE_SPEED;
        } else if (ball.targetY > rightPaddleY + paddleHeight / 2 + 10) {
            rightPaddleY += AI_PADDLE_SPEED;
        }

        // Limiter les mouvements de l'IA pour éviter de dépasser les limites du canvas
        rightPaddleY = Math.max(0, Math.min(rightPaddleY, canvas.height - paddleHeight));

        // Déplacer la balle
        ballX += ballSpeedX;
        ballY += ballSpeedY + 2 * Math.random() * ballSpeedY; // Ajouter une légère variation aléatoire

        // Rebondir la balle sur les bords supérieur et inférieur
        if (ballY + ballRadius >= canvas.height && ballSpeedY > 0) {
            ballSpeedY *= -1;
        }
        if (ballY - ballRadius <= 0 && ballSpeedY < 0) {
            ballSpeedY *= -1;
        }

        // Rebondir la balle sur la raquette gauche (Joueur)
        if (
            ballX - ballRadius <= paddleWidth + paddleOffset &&
            ballY > leftPaddleY &&
            ballY < leftPaddleY + paddleHeight &&
            ballSpeedX < 0
        ) {
            ballSpeedX = -ballSpeedX + 0.2; // Augmenter légèrement la vitesse
            ballX = paddleWidth + ballRadius; // Empêcher la balle de rester dans la raquette
        }

        // Rebondir la balle sur la raquette droite (IA)
        if (
            ballX + ballRadius >= canvas.width - paddleWidth - paddleOffset &&
            ballY > rightPaddleY &&
            ballY < rightPaddleY + paddleHeight &&
            ballSpeedX > 0
        ) {
            ballSpeedX = -ballSpeedX - 0.2; // Augmenter légèrement la vitesse
            ballX = canvas.width - paddleWidth - ballRadius; // Empêcher la balle de rester dans la raquette
        }

        // Gestion du score
        if (ballX - ballRadius < 0) { // Le joueur marque
            j2score += 1;
            stopBall();
        }
        if (ballX + ballRadius > canvas.width) { // L'IA marque
            j1score += 1;
            stopBall();
        }

        updateScores();

        // Vérifier si la partie est terminée
        if (j1score >= 5 || j2score >= 5) {
            if (ball)
                ball.trackingBall = 0;
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
            let line = lang === 'fr' ? `Félicitations ! Le gagnant est `
                : lang === 'en' ? `Congratulations! Winner is `
                : `Felicitaciones! El ganador es `;
            line += j1score >= 5 ? J1 : "BOT";
            line += '!';
            ctx.fillText(line, canvas.width / 2, canvas.height / 2);

            // Enregistrer l'historique du jeu
            function formatDate(date) {
                const year = date.getFullYear();
                const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Mois entre 01 et 12
                const day = date.getDate().toString().padStart(2, '0'); // Jour entre 01 et 31
                const hours = date.getHours().toString().padStart(2, '0'); // Heure entre 00 et 23
                const minutes = date.getMinutes().toString().padStart(2, '0'); // Minutes entre 00 et 59

                return `${year}-${month}-${day} ${hours}:${minutes}`;
            }

            const date = formatDate(new Date());  // Formatage de la date
            const score = `${j1score}-${j2score}`;
            const result = j1score > j2score ? 'Win' : 'Loss';

            postGameHistory("VS BOT", score, result, date)  // Envoi de l'historique du jeu
                .then(data => {
                    console.log("Historique du jeu bien enregistré :", {
                        opponent: "VS BOT",
                        score: score,
                        result: result,
                        date: date
                    });
                })
                .catch(error => {
                    console.error("Erreur lors de l'enregistrement de l'historique :", error);
                });
        }
        else {
            requestAnimationFrame(drawGame);
        }
    }

    function updateScores() {
        const scorej1 = document.getElementById("j1score-disp");
        const scorej2 = document.getElementById("j2score-disp");
        if (scorej1) {
            scorej1.textContent = `${J1}:${j1score}`;
        }
        if (scorej2) {
            scorej2.textContent = `BOT:${j2score}`;
        }
    };

    drawGame();
};


/* L'IA anticipe la trajectoire de la balle en calculant où elle atteindra
la raquette droite en fonction de sa position et de sa vitesse actuelles.
Elle ajuste ensuite sa position cible avec une probabilité d'erreur,
ajoutant un décalage aléatoire pour simuler des imprécisions humaines.
La raquette de l'IA se déplace progressivement vers cette cible à une vitesse limitée,
empêchant des mouvements instantanés et parfaits. Après chaque point marqué,
la balle est réinitialisée au centre et l'IA reprend le suivi en recalculant la nouvelle trajectoire. */
