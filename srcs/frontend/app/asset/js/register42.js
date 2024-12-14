// /asset/js/register42.js

import { router } from './router.js';
import { showMessage } from './alertManager.js';

export function initRegister42() {
    const API_BASE_URL = '/users';
    const form = document.getElementById('register42-form');
    const alertContainer = document.querySelector('.alert-container');
    const submitButton = form.querySelector('button[type="submit"]');
    const loadingOverlay = document.getElementById("register42-loading-overlay");
    const spinnerContainer = document.querySelector('.register42-spinner-container');
    const successCheck = document.getElementById('register42-success-check');
    const emailInput = document.getElementById('email'); // Champ email

    // Récupérer l'email depuis le backend
    fetch(`${API_BASE_URL}/get_oauth_info/`, {
        method: 'GET',
        credentials: 'include' // Inclure les cookies
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des informations OAuth.');
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            showMessage(alertContainer, '', 'error', 'register42.oauth_fetch_error');
            router.navigate('logout');
            return;
        }

        const email = data.email;

        if (!email || typeof email !== 'string') {
            showMessage(alertContainer, '', 'error', 'register42.invalid_email_error');
            router.navigate('logout');
            return;
        }

        // Pré-remplir le champ email
        if (emailInput) {
            emailInput.value = email;
            emailInput.disabled = true; // Empêcher la modification de l'email
        }
    })
    .catch(error => {
        console.error('Erreur lors de la récupération de l\'email OAuth :', error);
        showMessage(alertContainer, '', 'error', 'register42.oauth_fetch_error');
        router.navigate('logout');
    });

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Effacer les messages précédents
            // Pas nécessaire ici car showMessage remplace les messages existants

            const username = form.username.value.trim();
            const password = form.password.value;
            const confirmPassword = form['confirm-password'].value;

            // Validation des mots de passe
            if (password !== confirmPassword) {
                showMessage(alertContainer, '', 'error', 'register42.password_mismatch_error');
                return;
            }

            // Validation de la complexité du mot de passe
            if (!validatePassword(password)) {
                showMessage(alertContainer, '', 'error', 'register42.password_complexity_error');
                return;
            }

            // Validation du nom d'utilisateur
            if (username.length < 3) {
                showMessage(alertContainer, '', 'error', 'register42.username_length_error');
                return;
            }

            // Afficher l'overlay de chargement avec le spinner
            if (loadingOverlay) {
                loadingOverlay.style.display = 'flex';
                if (spinnerContainer) spinnerContainer.style.display = 'block';
                if (successCheck) successCheck.style.display = 'none';
            }

            // Désactiver le bouton de soumission
            if (submitButton) {
                submitButton.disabled = true;
            }

            // Enregistrer le temps de début
            const startTime = Date.now();
            const spinnerDuration = 1200; // 1,2 secondes
            const totalDuration = 2000; // 2 secondes

            // Récupérer l'email depuis le champ
            const email = emailInput.value;

            // Envoyer les données au backend pour l'inscription
            try {
                const response = await fetch(`${API_BASE_URL}/register42/`, {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    credentials: 'include',
                    body: JSON.stringify({
                        username,
                        password,
                        confirm_password: confirmPassword,
                        email
                    })
                });

                // Calculer le temps écoulé
                const elapsedTime = Date.now() - startTime;

                if (response.ok) {
                    // Attendre que le spinner ait duré au moins 1,2 seconde
                    if (elapsedTime < spinnerDuration) {
                        await new Promise(resolve => setTimeout(resolve, spinnerDuration - elapsedTime));
                    }

                    // Afficher le check de confirmation
                    if (spinnerContainer) spinnerContainer.style.display = 'none';
                    if (successCheck) successCheck.style.display = 'block';

                    // Attendre le reste du temps pour atteindre 2 secondes
                    const remainingTime = totalDuration - (Date.now() - startTime);
                    if (remainingTime > 0) {
                        await new Promise(resolve => setTimeout(resolve, remainingTime));
                    }

                    // Redirection vers la page d'accueil
                    router.navigate('home');
                } else {
                    // Gérer les erreurs retournées par le serveur
                    const data = await response.json();
                    if (data.username) {
                        showMessage(alertContainer, '', 'error', 'register42.username_error', { errors: data.username.join(' ') });
                    } else if (data.email) {
                        showMessage(alertContainer, '', 'error', 'register42.email_error', { errors: data.email.join(' ') });
                    } else if (data.password) {
                        showMessage(alertContainer, '', 'error', 'register42.password_error', { errors: data.password.join(' ') });
                    } else {
                        showMessage(alertContainer, '', 'error', 'register42.generic_error');
                    }
                    hideSpinner();
                }
            } catch (error) {
                console.error("Erreur lors de l'inscription via 42 :", error);
                showMessage(alertContainer, '', 'error', 'register42.unexpected_error');
                hideSpinner();
            }
        });
    }

    /**
     * Fonction pour valider la complexité du mot de passe
     */
    function validatePassword(password) {
        // Au moins 8 caractères, une majuscule, une minuscule et un chiffre
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return regex.test(password);
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

    // Bouton de retour à la page de login en passant par logout pour clear les cookies
    const backButton = document.getElementById("back-to-login-button");
    if (backButton) {
        backButton.addEventListener("click", () => {
            router.navigate('logout');
        });
    }
}
