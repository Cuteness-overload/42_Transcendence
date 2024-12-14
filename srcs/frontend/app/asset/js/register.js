// /asset/js/register.js

import { router } from './router.js';
import { showMessage } from './alertManager.js';

export function initRegister() {
    const API_BASE_URL = "/users";
    const registerForm = document.getElementById("register-form");
    const alertContainer = document.querySelector('.alert-container');
    const submitButton = registerForm.querySelector('button[type="submit"]');
    const loadingOverlay = document.getElementById("register-loading-overlay");
    const spinnerContainer = document.querySelector('.register-spinner-container');
    const successCheck = document.getElementById('register-success-check');

    if (registerForm) {
        registerForm.addEventListener("submit", async function (event) {
            event.preventDefault(); // Empêcher le comportement par défaut

            // Récupération des valeurs des champs d'entrée
            const username = document.getElementById("username-signup").value.trim();
            const email = document.getElementById("email-signup").value.trim();
            const password = document.getElementById("password-signup").value;
            const confirmPassword = document.getElementById("confirm-password").value;

            // Validation des champs
            if (!validateEmail(email)) {
                showMessage(alertContainer, '', 'error', 'register.invalid_email_error');
                return;
            }

            // **Nouvelle Vérification du Format de l'E-mail**
            if (isStudentEmail(email)) {
                showMessage(alertContainer, '', 'error', 'register.student_email_error');
                return;
            }

            if (password !== confirmPassword) {
                showMessage(alertContainer, '', 'error', 'register.password_mismatch_error');
                return;
            }

            if (!validatePassword(password)) {
                showMessage(alertContainer, '', 'error', 'register.password_complexity_error');
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

            try {
                const response = await fetch(`${API_BASE_URL}/register/`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, email, password }),
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

                    // Redirection vers la page de connexion
                    router.navigate('login');
                } else {
                    const errorData = await response.json();
                    if (errorData.username) {
                        showMessage(alertContainer, '', 'error', 'register.username_error', { errors: errorData.username.join(' ') });
                    } else if (errorData.email) {
                        showMessage(alertContainer, '', 'error', 'register.email_error', { errors: errorData.email.join(' ') });
                    } else if (errorData.password) {
                        showMessage(alertContainer, '', 'error', 'register.password_error', { errors: errorData.password.join(' ') });
                    } else {
                        showMessage(alertContainer, '', 'error', 'register.generic_error');
                    }
                    hideSpinner();
                }
            } catch (error) {
                console.error("Erreur de connexion:", error);
                showMessage(alertContainer, '', 'error', 'register.unexpected_error');
                hideSpinner();
            }
        });
    } else {
        console.error("Formulaire d'inscription non trouvé !");
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

    /**
     * Fonction pour valider une adresse email avec une expression régulière
     */
    function validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    /**
     * Fonction pour vérifier si l'e-mail appartient à l'école 42.
     * @param {string} email
     * @returns {boolean}
     */
    function isStudentEmail(email) {
        const studentEmailRegex = /^[^\s@]+@student\.42\.\w+$/;
        return studentEmailRegex.test(email);
    }

    /**
     * Fonction pour valider la complexité du mot de passe
     */
    function validatePassword(password) {
        // Au moins 8 caractères, une majuscule, une minuscule et un chiffre
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return regex.test(password);
    }

    // Bouton de retour à la page de login
    const backButton = document.getElementById("back-to-login-button");
    if (backButton) {
        backButton.addEventListener("click", () => {
            router.navigate('login');
        });
    }
}
