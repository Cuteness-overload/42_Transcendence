// /asset/js/connect42.js

import { router } from './router.js';
import { showMessage } from './alertManager.js';

export function initConnect42() {
    const API_BASE_URL = '/users';
    const form = document.getElementById('connect42-form');
    const alertContainer = document.querySelector('.alert-container');
    const submitButton = form.querySelector('button[type="submit"]');
    const loadingOverlay = document.getElementById("connect42-loading-overlay");

    // Mapping des messages d'erreur du backend
    const errorMessageMap = {
        "Identifiants invalides.": "connect42.connection_error",
        // Ajoutez d'autres mappages si nécessaire
    };

    // Récupérer l'email depuis le backend
    fetch(`${API_BASE_URL}/get_oauth_info/`, {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        const email = data.email;
        if (!email) {
            showMessage(alertContainer, '', 'error', 'connect42.email_missing_error');
            router.navigate('logout');
            return;
        }
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.value = email;
            emailInput.disabled = true;
        }
    })
    .catch(error => {
        console.error('Erreur lors de la récupération de l\'email OAuth :', error);
        showMessage(alertContainer, '', 'error', 'connect42.oauth_fetch_error');
        router.navigate('logout');
    });

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const password = form.password.value.trim();

            if (!password) {
                showMessage(alertContainer, '', 'error', 'connect42.fill_password_error');
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
            const spinnerDuration = 900; // 0,9 seconde

            try {
                const response = await fetch(`${API_BASE_URL}/connect42/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: 'include',
                    body: JSON.stringify({ password })
                });

                // Calculer le temps écoulé
                const elapsedTime = Date.now() - startTime;

                if (response.ok) {
                    // Attendre que le spinner ait duré au moins 0,9 seconde
                    if (elapsedTime < spinnerDuration) {
                        await new Promise(resolve => setTimeout(resolve, spinnerDuration - elapsedTime));
                    }

                    router.loginSuccess();

                    // Redirection vers la page d'accueil
                    router.navigate('home');
                } else {
                    const errorData = await response.json();
                    // Mapper le message d'erreur du backend à une clé i18n
                    const errorKey = errorMessageMap[errorData.error] || 'connect42.connection_error';
                    showMessage(alertContainer, '', 'error', errorKey);
                    hideSpinner();
                }
            } catch (error) {
                console.error("Erreur lors de la connexion via 42 :", error);
                showMessage(alertContainer, '', 'error', 'connect42.unexpected_error');
                hideSpinner();
            }
        });
    }

    // Écouteur d'événement pour le bouton "Retour"
    const backButton = document.getElementById("back-to-login-button");
    if (backButton) {
        backButton.addEventListener("click", () => {
            router.navigate('logout');
        });
    }

    /**
     * Fonction pour masquer l'overlay de chargement et réactiver le bouton de soumission.
     */
    function hideSpinner() {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        if (submitButton) {
            submitButton.disabled = false;
        }
    }
}
