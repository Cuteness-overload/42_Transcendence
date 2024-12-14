// /asset/js/home.js

const API_BASE_URL = "/users";
import { initNavbar } from './navbar.js';
import { router } from './router.js'; // Importer l'instance unique

export async function initHome() {
    const authenticated = await router.isAuthenticated();
    if (!authenticated) {
        alert("Votre session a expiré. Veuillez vous reconnecter.");
        router.navigate('logout');
        return;
    }
    await initNavbar();

    const logoutButton = document.getElementById('logout-button');
    const playButton = document.getElementById('play-button');
    const profileButton = document.getElementById('profile-button');
    const settingsButton = document.getElementById('settings-button');

    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/logout/`, {
                    method: "POST",
                    credentials: "include", // Inclure les cookies
                });

                if (response.ok) {
                    router.navigate('login');
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
            // Rediriger vers la page de jeu
            router.navigate('play');
        });
    }

    if (profileButton) {
        profileButton.addEventListener('click', () => {
            // Rediriger vers la page de profil
            router.navigate('profile');
        });
    }

    if (settingsButton) {
        settingsButton.addEventListener('click', () => {
            // Rediriger vers la page des paramètres
            router.navigate('settings');
        });
    }
}
