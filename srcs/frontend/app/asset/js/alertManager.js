// /asset/js/alertManager.js

import { applyTranslations } from './translator.js'; // Assurez-vous que translator.js exporte cette fonction

/**
 * Affiche un message d'alerte dans le conteneur d'alerte spécifié.
 * Remplace toute alerte existante par la nouvelle.
 * @param {HTMLElement} alertContainer - Le conteneur où afficher l'alerte.
 * @param {string} message - Texte du message (optionnel si i18nKey est fourni).
 * @param {string} type - 'success' ou 'error'.
 * @param {string} i18nKey - Clé de traduction i18n pour le message.
 * @param {object} i18nOptions - Options pour les variables dynamiques dans la traduction.
 */
export function showMessage(alertContainer, message, type, i18nKey = '', i18nOptions = {}) {
    if (!alertContainer) {
        console.error("Conteneur d'alerte non trouvé !");
        return;
    }

    // Vider le conteneur pour remplacer l'alerte précédente
    alertContainer.innerHTML = '';

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

    // Si une clé i18n est fournie, l'utiliser
    if (i18nKey) {
        textSpan.setAttribute('data-i18n', i18nKey);
        // Pour gérer les variables dynamiques (ex : {{username}})
        if (Object.keys(i18nOptions).length > 0) {
            for (const [key, value] of Object.entries(i18nOptions)) {
                textSpan.setAttribute(`data-i18n-options-${key}`, value);
            }
        }
    } else {
        // Si pas de clé i18n, fallback sur du texte brut
        textSpan.textContent = message;
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
