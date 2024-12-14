// /asset/js/profile.js

import { router } from './router.js';
import { applyTranslations } from './translator.js';
const API_BASE_URL = "/users";

export async function initProfile() {
    console.log("La page de profil est chargée.");

    // Afficher le spinner et masquer le contenu
    showLoading(true);
    try {
        await loadUserProfile();
        setupAvatarChange();
        setupFriendListButton();
        setupViewHistoryButton();
        applyTranslations(document.querySelector('.profile-page'));
    } catch (error) {
        console.error("Erreur lors de l'initialisation du profil :", error);
    } finally {
        // Masquer le spinner et afficher le contenu après 200 ms
        setTimeout(() => {
            showLoading(false);
        }, 200);
    }
}

async function loadUserProfile() {
    try {
        const response = await fetch(`${API_BASE_URL}/profile/`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert('Votre session a expiré. Veuillez vous reconnecter.');
                router.navigate('logout');
            }
            throw new Error(`Erreur HTTP! status: ${response.status}`);
        }

        const data = await response.json();
         // Affiche les données utilisateur dans la console
         console.log('Profil utilisateur chargé :', data);
        const usernameDisplay = document.getElementById('username-display');
        if (usernameDisplay) {
            usernameDisplay.textContent = data.username || "Utilisateur";
        } else {
            console.error("Élément 'username-display' introuvable.");
        }

        // Afficher l'avatar
        const avatarPreview = document.getElementById('avatar-preview');
        if (avatarPreview) {
            avatarPreview.src = data.avatar || '/media/avatars/default-avatar.png';
        } else {
            console.error("Élément 'avatar-preview' introuvable.");
        }
    } catch (error) {
        console.error('Erreur lors du chargement du profil :', error);
        showMessage('profile-alert-container', 'profile.load_error', 'error');
        throw error; // Relancer l'erreur pour gérer dans initProfile
    }
}

function setupAvatarChange() {
    const avatarInput = document.getElementById('avatar-input');
    if (avatarInput) {
        avatarInput.addEventListener('change', function() {
            updateAvatar();
        });
    } else {
        console.error("Élément 'avatar-input' introuvable.");
    }
}

function setupViewHistoryButton() {
    const viewHistoryButton = document.getElementById('view-history');
    const historyContainer = document.getElementById('history-container');
    const profileContainer = document.getElementById('profile-page');
    const backButton = document.getElementById('back-button'); // Bouton retour

    if (viewHistoryButton) {
        viewHistoryButton.addEventListener('click', async function() {
            try {
                // Effacer le contenu de l'historique et ajouter un bouton "Fermer"
                historyContainer.innerHTML = '<h2 data-i18n="profile.match_history">Historique des Parties</h2>';
                const closeHistoryButton = document.createElement('button');
                closeHistoryButton.id = 'close-history';
                closeHistoryButton.setAttribute('data-i18n', 'profile.close_history_button');
                closeHistoryButton.setAttribute('class', 'retro-button');
                closeHistoryButton.textContent = 'Fermer l\'historique';
                profileContainer.appendChild(closeHistoryButton);
                applyTranslations(document.querySelector('.profile-page'));

                // Récupérer les données d'historique via une API
                const response = await fetch(`${API_BASE_URL}/game-history/`, { 
                    method: 'GET',
                    credentials: 'include' 
                });

                if (!response.ok) {
                    throw new Error(`Erreur HTTP! Status: ${response.status}`);
                }

                const historyData = await response.json();const  formatDate = (_date) => {
                const date = new Date(_date)
                        const year = date.getFullYear();
                    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Mois entre 01 et 12
                    const day = date.getDate().toString().padStart(2, '0'); // Jour entre 01 et 31
                    const hours = date.getHours().toString().padStart(2, '0'); // Heure entre 00 et 23
                    const minutes = date.getMinutes().toString().padStart(2, '0'); // Minutes entre 00 et 59
                    return `${year}-${month}-${day} ${hours}:${minutes}`;
                }

                historyData.sort((a, b) => new Date(b.date) - new Date(a.date));

                historyData.forEach(function(game) {
                    // Créer le div pour chaque partie
                    const gameDiv = document.createElement('div');
                    gameDiv.classList.add('game-histo');

                    // Déterminer la couleur selon la victoire ou défaite
                   // Déterminer la couleur selon la victoire ou défaite
                    const victoryClass = game.result === i18next.t('game.victory') ? 'victory' : 'defeat';

                // Ajouter les informations de la partie dans le div
                gameDiv.innerHTML = `
                <p><strong>${i18next.t('game.mode_label')} :</strong> ${i18next.t('game.opponent')}</p>
                <div class="game-details">
                <p><strong>${i18next.t('game.date_label')} :</strong> ${formatDate(game.date)}</p>
                <p><strong>${i18next.t('game.score_label')} :</strong> <span class="score">${game.score}</span></p>
                <p class="${victoryClass}"><strong>${game.result}</strong></p>
                </div>
            `;
                    // Ajouter chaque div de partie au conteneur
                    historyContainer.appendChild(gameDiv);
                });

                // Afficher le conteneur de l'historique
                historyContainer.style.display = 'block';

                // Faire apparaître le bouton "Fermer l'historique" uniquement quand l'historique est visible
                viewHistoryButton.style.display = 'none'; // Masquer le bouton "Voir l'historique"
                closeHistoryButton.style.display = 'block'; // Afficher le bouton "Fermer l'historique"

                // Fermer l'historique lorsque le bouton "Fermer" est cliqué
                closeHistoryButton.addEventListener('click', function() {
                    historyContainer.style.display = 'none'; // Cacher l'historique
                    viewHistoryButton.style.display = 'block'; // Afficher le bouton "Voir l'historique"
                    profileContainer.removeChild(closeHistoryButton); // Supprimer le bouton "Fermer"
                    applyTranslations(document.querySelector('.profile-page'));
                });

            } catch (error) {
                console.error('Erreur lors de la récupération de l’historique des parties :', error);
                historyContainer.innerHTML = '<p>Erreur de chargement des données historiques.</p>';
            }
        });
    } else {
        console.error("Élément 'view-history' introuvable.");
    }

    // Retour au menu ou cacher l'historique
    if (backButton) {
        backButton.addEventListener('click', function() {
            historyContainer.style.display = 'none'; // Cacher l'historique
            // Remettre le bouton "Voir l'historique" visible et masquer "Fermer l'historique"
            viewHistoryButton.style.display = 'block'; // Afficher le bouton "Voir l'historique"
        });
    }
}



function updateAvatar() {
    const avatarInput = document.getElementById('avatar-input');
    const avatarFile = avatarInput.files[0];

    if (!avatarFile) {
        showMessage('profile-alert-container', 'profile.avatar_update_error', 'error');
        return;
    }

    // Vérification du type de fichier (par exemple, seulement images JPEG ou PNG)
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(avatarFile.type)) {
        showMessage('profile-alert-container', 'profile.avatar_update_error_format', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('avatar', avatarFile);

    fetch(`${API_BASE_URL}/profile/`, {
        method: 'PATCH',
        credentials: 'include', // Inclure les cookies
        body: formData
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else if (response.status === 401) {
            alert('Votre session a expiré. Veuillez vous reconnecter.');
            router.navigate('logout');
            throw new Error('Unauthorized');
        } else {
            return response.json().then(errorData => {
                throw new Error(errorData.detail || 'Erreur lors de la mise à jour de l\'avatar.');
            });
        }
    })
    .then(data => {
        // Mettre à jour l'affichage de l'avatar sur la page
        const avatarPreview = document.getElementById('avatar-preview');
        if (avatarPreview) {
            avatarPreview.src = data.avatar;
        }
        showMessage('profile-alert-container', 'profile.avatar_update_success', 'success');
    })
    .catch(error => {
        console.error('Erreur lors de la mise à jour de l\'avatar :', error);
        showMessage('profile-alert-container', 'profile.avatar_update_error', 'error');
    });
}

export function showMessage(containerId, i18nKey, type) {
    const alertContainer = document.getElementById(containerId);
    if (!alertContainer) {
        console.error(`Conteneur d'alerte avec l'ID '${containerId}' non trouvé !`);
        return;
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `alert ${type === 'success' ? 'alert-success' : 'alert-danger'} fade show`;
    messageDiv.style.transition = 'opacity 0.5s ease-in-out';

    // Déterminer l'icône
    const icon = type === 'success' ? '✔' : '✖';

    // Créer l'HTML interne avec l'icône et le texte
    const iconSpan = document.createElement('span');
    iconSpan.className = 'alert-icon';
    iconSpan.textContent = icon;

    const textSpan = document.createElement('span');
    textSpan.className = 'alert-text';
    if (i18nKey) {
        textSpan.setAttribute('data-i18n', i18nKey);
    }

    messageDiv.appendChild(iconSpan);
    messageDiv.appendChild(textSpan);
    alertContainer.appendChild(messageDiv);

    // Appliquer les traductions si i18nKey est fourni
    applyTranslations(messageDiv);

    // Faire disparaître le message après 5 secondes
    setTimeout(() => {
        messageDiv.classList.remove('show');
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 500);
    }, 5000);
}


async function setupFriendListButton() { // Fonction unique et asynchrone
    const listFriendButton = document.getElementById('list-friend');
    const friendListContainer = document.getElementById('friend-list-container');
    const friendListDisplay = document.getElementById('friend-list-display-id');
    const closeFriendListButton = document.getElementById('close-friend-list');

    // Initialiser l'affichage
    if (friendListContainer && friendListDisplay) {
        friendListContainer.style.display = 'none';
        friendListDisplay.style.display = 'none';
    }

    async function fetchFriendList() {
        try {
            const response = await fetch(`${API_BASE_URL}/friend-list/`, { // URL complète
                method: 'GET',
                credentials: 'include', // Inclure les cookies dans la requête
            });
            const data = await response.json();
            if (response.ok) {
                return data.friends;
            } else {
                throw new Error(data.error || "Erreur lors de la récupération des amis");
            }
        } catch (error) {
            console.error("Erreur lors de la récupération de la liste des amis", error);
            showMessage("Erreur lors de la récupération de la liste des amis.", 'error');
        }
    }

    function displayFriendList(friends) {
        friendListDisplay.innerHTML = '';
    
        if (!friends || friends.length === 0) {
            const noFriends = document.createElement('p');
            noFriends.textContent = i18next.t('profile.no_friends');  // Utilisation de la traduction ici
            friendListDisplay.appendChild(noFriends);
        } else {
            friends.forEach(friend => {
                const friendItem = document.createElement('div');
                friendItem.classList.add('friend-item');
                friendItem.textContent = friend.username;  // Le nom d'utilisateur n'a pas besoin d'être traduit
                friendListDisplay.appendChild(friendItem);
            });
        }
        friendListDisplay.style.display = 'block';
    }

    async function updateFriendList() {
        const friends = await fetchFriendList();
        if (friends) {
            displayFriendList(friends);
        }
    }

    async function addFriend(friendUsername) {
        try {
            const friends = await fetchFriendList();
    
            if (friends && friends.some(friend => friend.username === friendUsername)) {
                showMessage('friend-added-notification', i18next.t('profile.already_friend'), 'error');
                return;
            }
    
            const response = await fetch(`${API_BASE_URL}/add-friend/`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ friend_username: friendUsername })
            });
    
            const data = await response.json();
    
            if (response.ok) {
                showMessage('friend-added-notification', i18next.t('profile.friend_added_success', { username: friendUsername }), 'success');
                await updateFriendList();
            } else {
                if (data.error === 'Cannot add yourself') {
                    showMessage('friend-added-notification', i18next.t('profile.cannot_add_self'), 'error');
                } else if (data.error === 'User not found') {
                    showMessage('friend-added-notification', i18next.t('profile.user_not_found'), 'error');
                } else {
                    showMessage('friend-added-notification', i18next.t('profile.friend_added_error'), 'error');
                }
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout de l'ami", error);
            showMessage('friend-added-notification', i18next.t('profile.friend_added_error'), 'error');
        }
    }

    async function removeFriend(friendUsername) {
        try {
            const response = await fetch(`${API_BASE_URL}/delete-friend/`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ friend_username: friendUsername })
            });
    
            const data = await response.json();
            const notificationDiv = document.getElementById('friend-added-notification');
            
            if (notificationDiv) {
                notificationDiv.style.display = 'block';
    
                if (response.ok) {
                    showMessage('friend-added-notification', i18next.t('profile.friend_removed_success', { username: friendUsername }), 'success');
                    await updateFriendList();
                } else {
                    if (data.error === 'Friend not found') {
                        showMessage('friend-added-notification', i18next.t('profile.user_not_found'), 'error');
                    } else {
                        showMessage('friend-added-notification', i18next.t('profile.friend_removed_error'), 'error');
                    }
                }
            }
        } catch (error) {
            console.error("Erreur lors de la suppression de l'ami", error);
            const notificationDiv = document.getElementById('friend-added-notification');
            if (notificationDiv) {
                notificationDiv.style.display = 'block';
                showMessage('friend-added-notification', i18next.t('profile.removed_friend_error'), 'error');
            }
        }
    }
    

    // Attacher les écouteurs d'événements uniquement une fois
    if (listFriendButton) {
        listFriendButton.addEventListener('click', function () {
            friendListContainer.style.display = 'block';
        });
    } else {
        console.error("Élément 'list-friend' introuvable.");
    }

    // Fermeture de la liste d'amis
    if (closeFriendListButton) {
        closeFriendListButton.addEventListener('click', function () {
            friendListContainer.style.display = 'none';
        });
    } else {
        console.error("Élément 'close-friend-list' introuvable.");
    }

    const viewFriendsButton = document.getElementById('view-friends-id');
    if (viewFriendsButton) {
        viewFriendsButton.addEventListener('click', async function () {
            await updateFriendList();
        });
    } else {
        console.error("Élément 'view-friends-id' introuvable.");
    }
 // Ajouter un ami
const addFriendButton = document.getElementById('add-friend-id');
if (addFriendButton) {
    addFriendButton.addEventListener('click', async function () {
        // Utilisation de i18next pour traduire le message du prompt
        const friendUsername = prompt(i18next.t('profile.enter_friend_username'));
        if (friendUsername) {
            await addFriend(friendUsername);
        }
    });
} else {
    console.error("Élément 'add-friend-id' introuvable.");
}


// Supprimer un ami
const removeFriendButton = document.getElementById('remove-friend-id');
if (removeFriendButton) {
    removeFriendButton.addEventListener('click', async function () {
        // Utilisation de i18next pour traduire le message du prompt
        const friendUsername = prompt(i18next.t('profile.remove_friend_username'));  
        if (friendUsername) {
            await removeFriend(friendUsername);
        }
    });
} else {
    console.error("Élément 'remove-friend-id' introuvable.");
}

}

// function showFriendAddedNotification(message, isError = false) {
//     const notification = document.createElement('div');
//     notification.classList.add('friend-added-notification');
//     if (isError) {
//         notification.classList.add('alert', 'alert-danger');
//     } else {
//         notification.classList.add('alert', 'alert-success');
//     }
//     notification.textContent = message;
//     document.body.appendChild(notification);
//     setTimeout(() => {
//         notification.remove();
//     }, 1500);
// }

// Fonction pour afficher ou masquer le spinner de chargement
function showLoading(isLoading) {
    const profilePage = document.querySelector('.profile-page');
    if (isLoading) {
        profilePage.classList.add('loading');
        profilePage.classList.remove('loaded');
    } else {
        profilePage.classList.remove('loading');
        profilePage.classList.add('loaded');
    }
}
