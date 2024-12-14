import { applyTranslations } from "./translator.js";

let size = 1;
let speed = 1;
let mapMode = 0;
let players = [];

const API_BASE_URL = "/users";

export {size, speed, mapMode, players};


export async function initPlay() {
    const authenticated = await router.isAuthenticated();
    if (!authenticated) {
        alert('Votre session a expiré. Veuillez vous reconnecter.');
        window.location.hash = '#/login';
        return;
    }


    const unselected = '';
    const selectedText = 'rgb(174 13 253 / 54%)';
    const selected = 'white';

    const startGameButton = document.getElementById('start-game-play-menu-button');
    const twoPlayer = document.getElementById('play-menu-2P-button');
    const solo = document.getElementById('play-menu-VsAi-button');
    twoPlayer.style.backgroundColor = selected;
    twoPlayer.style.color = selectedText;
    const slowBall = document.getElementById('ball-menu-slow-button');
    const normalBall = document.getElementById('ball-menu-normal-button');
    const fastBall = document.getElementById('ball-menu-fast-button');
    const hellBall = document.getElementById('ball-menu-hell-button');
    normalBall.style.backgroundColor = selected;
    normalBall.style.color = selectedText;
    const smallPaddle = document.getElementById('paddle-menu-small-button');
    const normalPaddle = document.getElementById('paddle-menu-normal-button');
    const bigPaddle = document.getElementById('paddle-menu-big-button');
    normalPaddle.style.backgroundColor = selected;
    normalPaddle.style.color = selectedText;
    const fourPlayer = document.getElementById('play-menu-4P-button');
    const mapAnormal = document.getElementById('map-menu-hole-button');
    const mapNormal = document.getElementById('map-menu-normal-button');
    const mapObstacle = document.getElementById('map-menu-obstacle-button');
    mapNormal.style.backgroundColor = selected;
    mapNormal.style.color = selectedText;
    const mapMenu = document.getElementById('map-settings');
    const all = document.getElementById('allFields');
    const unique = document.getElementById('uniques');
    let mode = '2P';
    mapMode = 0;
    size = 1;
    speed = 1;

    if (twoPlayer) {
        twoPlayer.addEventListener('click', () => {
            twoPlayer.style.backgroundColor = selected;
            twoPlayer.style.color = selectedText;
            solo.style.backgroundColor = unselected;
            solo.style.color = selected;
            fourPlayer.style.backgroundColor = unselected;
            fourPlayer.style.color = selected;
            mode = '2P';
            mapMenu.style.display = 'flex';
        });
    }

    if (solo) {
        solo.addEventListener('click', () => {
            twoPlayer.style.backgroundColor = unselected;
            twoPlayer.style.color = selected;
            solo.style.backgroundColor = selected;
            solo.style.color = selectedText;
            fourPlayer.style.backgroundColor = unselected;
            fourPlayer.style.color = selected;
            mode = '1P';
            mapMenu.style.display = 'none';
        });
    }
    if (fourPlayer) {
        fourPlayer.addEventListener('click', () => {
            twoPlayer.style.backgroundColor = unselected;
            twoPlayer.style.color = selected;
            solo.style.backgroundColor = unselected;
            solo.style.color = selected;
            fourPlayer.style.backgroundColor = selected;
            fourPlayer.style.color = selectedText;
            mode = '4P';
            mapMenu.style.display = 'none';
        });
    }

    if (normalBall) {
        normalBall.addEventListener('click', () => {
            normalBall.style.backgroundColor = selected;
            normalBall.style.color = selectedText;
            slowBall.style.backgroundColor = unselected;
            slowBall.style.color = selected;
            fastBall.style.backgroundColor = unselected;
            fastBall.style.color = selected;
            hellBall.style.backgroundColor = unselected;
            hellBall.style.color = selected;
            speed = 1;
        });
    }
    if (slowBall) {
            slowBall.addEventListener('click', () => {
            normalBall.style.backgroundColor = unselected;
            normalBall.style.color = selected;
            slowBall.style.backgroundColor = selected;
            slowBall.style.color = selectedText;
            fastBall.style.backgroundColor = unselected;
            fastBall.style.color = selected;
            hellBall.style.backgroundColor = unselected;
            hellBall.style.color = selected;
            speed = 0.7;
        });
    }
    if (fastBall) {
        fastBall.addEventListener('click', () => {
            normalBall.style.backgroundColor = unselected;
            normalBall.style.color = selected;
            slowBall.style.backgroundColor = unselected;
            slowBall.style.color = selected;
            fastBall.style.backgroundColor = selected;
            fastBall.style.color = selectedText;
            hellBall.style.backgroundColor = unselected;
            hellBall.style.color = selected;
            speed = 1.3;
        });
    }
    if (hellBall) {
        hellBall.addEventListener('click', () => {
            normalBall.style.backgroundColor = unselected;
            normalBall.style.color = selected;
            slowBall.style.backgroundColor = unselected;
            slowBall.style.color = selected;
            fastBall.style.backgroundColor = unselected;
            fastBall.style.color = selected;
            hellBall.style.backgroundColor = selected;
            hellBall.style.color = selectedText;
            speed = 1.5;
        });
    }


    if (normalPaddle) {
        normalPaddle.addEventListener('click', () => {
            normalPaddle.style.backgroundColor = selected;
            normalPaddle.style.color = selectedText;
            smallPaddle.style.backgroundColor = unselected;
            smallPaddle.style.color = selected;
            bigPaddle.style.backgroundColor = unselected;
            bigPaddle.style.color = selected;
            size = 1;
        });
    }


    if (smallPaddle) {
            smallPaddle.addEventListener('click', () => {
            normalPaddle.style.backgroundColor = unselected;
            normalPaddle.style.color = selected;
            smallPaddle.style.backgroundColor = selected;
            smallPaddle.style.color = selectedText;
            bigPaddle.style.backgroundColor = unselected;
            bigPaddle.style.color = selected;
            size = 0.6;
        });
    }
    if (bigPaddle) {
        bigPaddle.addEventListener('click', () => {
            normalPaddle.style.backgroundColor = unselected;
            normalPaddle.style.color = selected;
            smallPaddle.style.backgroundColor = unselected;
            smallPaddle.style.color = selected;
            bigPaddle.style.backgroundColor = selected;
            bigPaddle.style.color = selectedText;
            size = 1.4;
        });
    }

    if (mapNormal) {
        mapNormal.addEventListener('click', () => {
            mapNormal.style.backgroundColor = selected;
            mapNormal.style.color = selectedText;
            mapAnormal.style.backgroundColor = unselected;
            mapAnormal.style.color = selected;
            mapObstacle.style.backgroundColor = unselected;
            mapObstacle.style.color = selected;
            mapMode = 0;
        });
    }
    if (mapAnormal) {
        mapAnormal.addEventListener('click', () => {
            mapNormal.style.backgroundColor = unselected;
            mapNormal.style.color = selected;
            mapAnormal.style.backgroundColor = selected;
            mapAnormal.style.color = selectedText;
            mapObstacle.style.backgroundColor = unselected;
            mapObstacle.style.color = selected;
            mapMode = 1;
        });
    }
    if (mapObstacle) {
        mapObstacle.addEventListener('click', () => {
            mapNormal.style.backgroundColor = unselected;
            mapNormal.style.color = selected;
            mapAnormal.style.backgroundColor = unselected;
            mapAnormal.style.color = selected;
            mapObstacle.style.backgroundColor = selected;
            mapObstacle.style.color = selectedText;
            mapMode = 2;
        });
    }

    const tournament = document.getElementById('play-menu-tournament-button');
    const menu = document.getElementById('play-menu');
    const tournamentMode = document.getElementById('tournament-menu');
    const tournamentForm = document.getElementById('tournament-form');
    const tournamentReturnButton = document.getElementById('tournament-return-button');
    
    if (tournament){
        tournament.addEventListener('click', () => {
            unique.style.display = 'none';
            all.style.display = 'none';
            tournamentMode.style.display = 'flex';
            startGameButton.style.display = 'none';
            menu.style.display = 'none';

            fetch(`${API_BASE_URL}/profile/`, {
                method: 'GET',
                credentials: 'include'
            })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) {
                        alert('response initplay: Votre session a expiré. Veuillez vous reconnecter.');
                        window.location.hash = '#/login';
                    }
                    throw new Error(`Erreur HTTP! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const P1Tournament = document.getElementById('P1');
                if (P1Tournament) {
                    P1Tournament.readOnly = false;
                    P1Tournament.value = data.username;
                    P1Tournament.readOnly = true;
                } else {
                    console.error("Élément 'username-display' introuvable.");
                }
            })
            .catch(error => {
                console.error('Erreur lors du chargement du profil :', error);
                showMessage('Erreur lors du chargement du profil.', 'error');
            });
        });
    }

    if (tournamentForm) {
        tournamentForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent the default form submission behavior

            // Fetch player names from the form inputs
            players.length = 0;
            players.push(
                document.getElementById('P1').value,
                document.getElementById('P2').value,
                document.getElementById('P3').value,
                document.getElementById('P4').value,
            );
            const allFieldsFilled = players.every(player => player !== "");
            const uniqueNames = new Set(players);
            if (!allFieldsFilled) {
                players.length = 0;
                showMessage('allFields');
            } else if (uniqueNames.size !== players.length) {
                players.length = 0;
                showMessage('uniques');
            } else {
                router.navigate('start-game-tournament');
            }
        });
    }

        if (tournamentMode.style.display != 'none' && tournamentReturnButton){
            tournamentReturnButton.addEventListener('click',()=>{
                tournamentForm.reset();
                tournamentMode.style.display = 'none';
                menu.style.display = 'grid';
            startGameButton.style.display = 'inline-block';
        });
    }

    if (startGameButton) {
        startGameButton.addEventListener('click', () => {
            switch(mode){
                case '1P':
                    router.navigate('start-game-solo');
                    break;
                case '2P':
                    router.navigate('start-game-2P');
                    break;
                case '4P':
                    router.navigate('start-game-4P');
                    break;
            }
        });
    }

    function showMessage(message) {
        if (all && message === 'allFields') {
            all.style.display = 'block';
            unique.style.display = 'none';
        } else {
            unique.style.display = 'block';
            all.style.display = 'none';
        }
        applyTranslations();
    }
}

