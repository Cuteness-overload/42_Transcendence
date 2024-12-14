// /asset/js/app.js

import { router } from './router.js';
import { initI18next } from './translator.js';

// Fonction pour gérer l'affichage du titre
export async function handleTitleDisplay() {
    const mainTitle = document.getElementById('main-title');
    if (mainTitle) {
        const authenticated = await router.isAuthenticated();
        if (authenticated) {
            mainTitle.style.display = 'none';
        } else {
            mainTitle.style.display = 'block';
        }
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const app = document.getElementById("app");
    if (!app) {
        console.error("Élément principal non trouvé pour charger les vues.");
        return;
    }

    // Assigner l'instance unique au window si nécessaire
    window.router = router;

    // Initialiser i18next avant de démarrer le routeur
    try {
        await initI18next();
        console.log("i18next initialisé avec succès.");
    } catch (error) {
        console.error("Erreur lors de l'initialisation d'i18next:", error);
    }

    // Lancer le routeur avec gestion multi-onglet
    await router.start();

    // Gérer l'affichage du titre
    await handleTitleDisplay();
});
