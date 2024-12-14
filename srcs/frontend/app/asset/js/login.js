// /asset/js/login.js

import { handleTitleDisplay } from './app.js';
import { router } from './router.js';
import { applyTranslations } from './translator.js'; // Assurez-vous que translator.js exporte cette fonction

const API_BASE_URL = "/users";

export function initLogin() {
    const loginForm = document.getElementById("login-form");
    const submitButton = loginForm.querySelector('button[type="submit"]');
    const loadingOverlay = document.getElementById("login-loading-overlay");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value;
            const code_2fa = document.getElementById("code-2fa").value.trim();

            // Vérification que les champs ne sont pas vides
            if (!username || !password) {
                showMessage('', 'error', 'login.fill_all_fields_error');
                return;
            }

            // Afficher l'overlay de chargement
            if (loadingOverlay) {
                loadingOverlay.style.display = 'flex';
            }

            // Désactiver le bouton de soumission
            if (submitButton) {
                submitButton.disabled = true;
            }

            // Enregistrer le temps de début
            const startTime = Date.now();
            const spinnerDuration = 1200; // 1,2 secondes

            try {
                const response = await fetch(`${API_BASE_URL}/token/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password, code_2fa }),
                    credentials: "include",
                });

                // Calculer le temps écoulé
                const elapsedTime = Date.now() - startTime;

                if (response.ok) {
                    const data = await response.json();

                    handleTitleDisplay();

                    // Attendre que le spinner ait duré au moins 1,2 seconde
                    if (elapsedTime < spinnerDuration) {
                        await new Promise(resolve => setTimeout(resolve, spinnerDuration - elapsedTime));
                    }

                    router.loginSuccess(); // Programmer le rafraîchissement des tokens

                    // Redirection vers la page d'accueil
                    router.navigate('home');
                } else {
                    const errorData = await response.json();
                    showMessage('', 'error', 'login.connection_error');
                    hideSpinner();
                }
            } catch (error) {
                console.error("Erreur de connexion :", error);
                showMessage('', 'error', 'login.unexpected_error');
                hideSpinner();
            }
        });
    }

    // Gestion des boutons de navigation
    const registerButton = document.getElementById("register-button");
    const oauthLoginButton = document.getElementById("oauth-login-42");

    if (registerButton) {
        registerButton.addEventListener("click", () => {
            router.navigate('register');
        });
    }

    if (oauthLoginButton) {
        oauthLoginButton.addEventListener("click", async () => {
            try {
                // Rediriger vers l'endpoint OAuth
                window.location.href = `${API_BASE_URL}/oauth/login/`;
            } catch (error) {
                console.error("Erreur lors de la redirection OAuth :", error);
                showMessage('', 'error', 'login.unexpected_error');
            }
        });
    }
}

/**
 * Fonction pour afficher un message d'alerte.
 * @param {string} message - Texte du message (optionnel si i18nKey est fourni).
 * @param {string} type - 'success' ou 'error'.
 * @param {string} i18nKey - Clé de traduction i18n pour le message.
 * @param {object} i18nOptions - Options pour les variables dynamiques dans la traduction.
 */
function showMessage(message, type, i18nKey = '', i18nOptions = {}) {
    // Cibler le conteneur d'alerte spécifique à la page de login
    let alertContainer = document.querySelector('.login-alert-container');
    if (!alertContainer) {
        const formTitle = document.querySelector('.form-title');
        alertContainer = document.createElement('div');
        alertContainer.classList.add('login-alert-container');
        formTitle.insertAdjacentElement('afterend', alertContainer);
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

/**
 * Fonction pour masquer l'overlay de chargement et réactiver le bouton de soumission.
 */
function hideSpinner() {
    const loadingOverlay = document.getElementById("login-loading-overlay");
    const submitButton = document.querySelector("#login-form button[type='submit']");

    // Masquer l'overlay de chargement
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }

    // Réactiver le bouton de soumission
    if (submitButton) {
        submitButton.disabled = false;
    }
}
