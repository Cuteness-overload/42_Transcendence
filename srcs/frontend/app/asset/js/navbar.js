// /asset/js/navbar.js

const API_BASE_URL = "/users";
import { router } from './router.js'; // Importer l'instance unique
import { applyTranslations } from './translator.js'; // Importer applyTranslations

export async function initNavbar() {
    const navbarContainer = document.getElementById('navbar-container');

    if (!navbarContainer) {
        console.error("Conteneur de la navbar non trouvé !");
        return;
    }

    try {
        const response = await fetch('/views/navbar.html', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Failed to load navbar: ${response.statusText}`);
        }

        const navbarHTML = await response.text();
        navbarContainer.innerHTML = navbarHTML;

        // **Appliquer les traductions à la navbar**
        applyTranslations(navbarContainer);

        // Sélectionner les boutons de la navbar
        const logoutButton = document.getElementById('nav-logout-button');
        const playButton = document.getElementById('nav-play-button');
        const profileButton = document.getElementById('nav-profile-button');
        const settingsButton = document.getElementById('nav-settings-button');

        // Ajouter les écouteurs d'événements aux boutons
        if (logoutButton) {
            logoutButton.addEventListener('click', async () => {
                try {
                    const response = await fetch(`${API_BASE_URL}/logout/`, {
                        method: "POST",
                        credentials: "include", // Inclure les cookies
                    });

                    if (response.ok) {
                        router.navigate('logout'); // Utiliser l'instance unique
                    } else {
                        console.error("Erreur lors de la déconnexion :", response.statusText);
                    }
                } catch (error) {
                    console.error("Erreur lors de la déconnexion :", error);
                }
            });
        }

        if (playButton) {
            playButton.addEventListener('click', () => {
                router.navigate('play');
            });
        }
        if (profileButton) {
            profileButton.addEventListener('click', () => {
                router.navigate('profile');
            });
        }
        if (settingsButton) {
            settingsButton.addEventListener('click', () => {
                router.navigate('settings');
            });
        }
    } catch (error) {
        console.error("Erreur lors du chargement de la navbar :", error);
        alert("Erreur lors du chargement de la barre de navigation."); // Remplacer showNotification par alert
    }
}
