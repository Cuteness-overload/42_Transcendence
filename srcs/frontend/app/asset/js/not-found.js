// /app/js/not-found.js

import { router } from './router.js';
import { applyTranslations } from './translator.js'; // Assurez-vous que cette fonction est correctement importée

export function initNotFound() {
    const contentDiv = document.getElementById('app');
    contentDiv.innerHTML = `
        <div class="not-found">
            <h2 data-i18n="not_found.title">404 - Page Non Trouvée</h2>
            <p data-i18n="not_found.message">La page que vous cherchez n'existe pas.</p>
            <button class="retro-button" data-i18n="not_found.back_button" onclick="router.navigate('home')">Retour à l'accueil</button>
        </div>
    `;

    // Appliquer les traductions après l'insertion du contenu
    applyTranslations(contentDiv);
}
