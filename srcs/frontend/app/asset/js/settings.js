// /asset/js/settings.js

const API_BASE_URL = "/users";
import { router } from './router.js';
import { applyTranslations } from './translator.js';

export function initSettings() {
    const btnChangeUsername = document.getElementById("btn-change-username");
    const btnChangePassword = document.getElementById("btn-change-password");
    const btnDeleteAccount = document.getElementById("btn-delete-account");
    const btnChange2FA = document.getElementById("btn-change-2fa");
    const settingsContent = document.getElementById("settings-content");

    // Fonction pour afficher des messages
    function showMessage(container, messageKey, type) {
        container.innerHTML = `
            <div class="alert alert-${type}">
                ${i18next.t(messageKey)}
            </div>
        `;
    }


    // Fonction pour valider la complexité du mot de passe
    function validatePassword(password) {
        // Au moins 8 caractères, une majuscule, une minuscule et un chiffre
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return regex.test(password);
    }

    // Fonction pour charger le formulaire de changement de nom d'utilisateur
    function loadChangeUsernameForm() {
        settingsContent.innerHTML = `
            <form id="change-username-form" class="retro-form">
                <h3 data-i18n="settings.change_username_title">Changer le nom d'utilisateur</h3>
                <div class="mb-3">
                    <label for="new_username" class="form-label" data-i18n="settings.new_username_label">Nouveau nom d'utilisateur</label>
                    <input type="text" class="form-control retro-input" id="new_username" name="new_username" required
                        data-i18n-attr="placeholder" data-i18n-key="settings.new_username_placeholder" placeholder="Entrez votre nouveau nom d'utilisateur">
                </div>
                <div class="d-flex gap-2">
                    <button type="submit" class="retro-button btn-primary" data-i18n="settings.update_button">Mettre à Jour</button>
                    <button type="button" id="cancel-change-username" class="retro-button btn-secondary" data-i18n="settings.cancel_button">Annuler</button>
                </div>
            </form>
        `;

        // Appliquer les traductions au nouveau contenu
        applyTranslations(settingsContent);

        const changeUsernameForm = document.getElementById("change-username-form");
        const cancelButton = document.getElementById("cancel-change-username");

        changeUsernameForm.addEventListener("submit", async function(event) {
            event.preventDefault();
            const newUsername = document.getElementById("new_username").value.trim();

            // Validation du nom d'utilisateur
            if (newUsername.length < 3) {
                showMessage(settingsContent, "settings.username_length_error", "danger");
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/profile/`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include", // Inclure les cookies
                    body: JSON.stringify({ username: newUsername })
                });

                const result = await response.json();

                if (response.ok) {
                    showMessage(settingsContent, "settings.username_updated_success", "success");
                } else if (response.status === 401) {
                    // Session expirée
                    alert(i18next.t("settings.session_expired"));
                    router.navigate('logout');
                } else {
                    const error = result.username ? result.username.join(" ") : result.detail || i18next.t("settings.update_error");
                    showMessage(settingsContent, error, "danger");
                }
            } catch (error) {
                console.error("Erreur:", error);
                showMessage(settingsContent, "settings.unexpected_error", "danger");
            }
        });

        cancelButton.addEventListener("click", () => {
            settingsContent.innerHTML = "";
        });
    }


    // Fonction pour charger le formulaire de changement de mot de passe
    function loadChangePasswordForm() {
        settingsContent.innerHTML = `
            <form id="change-password-form" class="retro-form">
                <h3 data-i18n="settings.change_password_title">Changer le mot de passe</h3>
                <div class="mb-3">
                    <label for="old_password" class="form-label" data-i18n="settings.old_password_label">Ancien mot de passe</label>
                    <input type="password" class="form-control retro-input" id="old_password" name="old_password" required
                        data-i18n-attr="placeholder" data-i18n-key="settings.old_password_placeholder" placeholder="Entrez votre ancien mot de passe">
                </div>
                <div class="mb-3">
                    <label for="new_password" class="form-label" data-i18n="settings.new_password_label">Nouveau mot de passe</label>
                    <input type="password" class="form-control retro-input" id="new_password" name="new_password" required
                        data-i18n-attr="placeholder" data-i18n-key="settings.new_password_placeholder" placeholder="Entrez votre nouveau mot de passe">
                </div>
                <div class="mb-3">
                    <label for="confirm_new_password" class="form-label" data-i18n="settings.confirm_new_password_label">Confirmez le nouveau mot de passe</label>
                    <input type="password" class="form-control retro-input" id="confirm_new_password" name="confirm_new_password" required
                        data-i18n-attr="placeholder" data-i18n-key="settings.confirm_new_password_placeholder" placeholder="Confirmez votre nouveau mot de passe">
                </div>
                <div class="mb-3" id="div_2fa" hidden>
                    <label for="code_2fa" class="form-label" data-i18n="settings.code_2fa_label">Entrez votre code 2FA</label>
                    <input type="text" class="form-control retro-input" id="code_2fa" name="code_2fa"
                        data-i18n-attr="placeholder" data-i18n-key="settings.code_2fa_placeholder" placeholder="Entrez votre code 2FA">
                </div>
                <div class="d-flex gap-2">
                    <button type="submit" class="retro-button btn-primary" data-i18n="settings.update_button">Mettre à Jour</button>
                    <button type="button" id="cancel-change-password" class="retro-button btn-secondary" data-i18n="settings.cancel_button">Annuler</button>
                </div>
            </form>
        `;

        // Appliquer les traductions
        applyTranslations(settingsContent);

        check2FAStatus();
        const changePasswordForm = document.getElementById("change-password-form");
        const cancelButton = document.getElementById("cancel-change-password");

        changePasswordForm.addEventListener("submit", async function(event) {
            event.preventDefault();
            const oldPassword = document.getElementById("old_password").value;
            const newPassword = document.getElementById("new_password").value;
            const confirmPassword = document.getElementById("confirm_new_password").value;
            const code2fa = document.getElementById("code_2fa").value;

            // Validation de la correspondance des mots de passe
            if (newPassword !== confirmPassword) {
                showMessage(settingsContent, "settings.password_mismatch", "danger");
                return;
            }

            // Validation de la complexité du mot de passe
            if (!validatePassword(newPassword)) {
                showMessage(settingsContent, "settings.password_complexity_error", "danger");
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/profile/password-change/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include", // Inclure les cookies
                    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword, code_2fa: code2fa })
                });

                const result = await response.json();

                if (response.ok) {
                    showMessage(settingsContent, "settings.password_updated_success", "success");
                    // Déconnexion après changement de mot de passe
                    //router.navigate('login');
                } else if (response.status === 401) {
                    // Session expirée
                    alert(i18next.t("settings.session_expired"));
                    router.navigate('logout');
                } else {
                    const error = result.old_password ? result.old_password.join(" ") :
                        result.new_password ? result.new_password.join(" ") :
                        result.detail || i18next.t("settings.update_error");
                    showMessage(settingsContent, error, "danger");
                }
            } catch (error) {
                console.error("Erreur:", error);
                showMessage(settingsContent, "settings.unexpected_error", "danger");
            }
        });

        cancelButton.addEventListener("click", () => {
            settingsContent.innerHTML = "";
        });
    }


    // Fonction pour supprimer le compte
    function deleteAccount() {
        const confirmation = confirm(i18next.t("settings.delete_account_confirmation"));

        if (!confirmation) return;

        fetch(`${API_BASE_URL}/profile/`, {
            method: "DELETE",
            credentials: "include" // Inclure les cookies
        })
        .then(response => {
            if (response.status === 204) {
                alert(i18next.t("settings.account_deleted"));
                // Déconnexion et redirection vers la page de connexion
                router.navigate('login');
            } else if (response.status === 401) {
                // Session expirée
                alert(i18next.t("settings.session_expired"));
                router.navigate('logout');
            } else {
                return response.json().then(data => {
                    throw new Error(data.detail || i18next.t("settings.delete_account_error"));
                });
            }
        })
        .catch(error => {
            console.error("Erreur:", error);
            showMessage(settingsContent, error.message, "danger");
        });
    }

    async function check2FAStatus() {
        try {
            const response = await fetch(`${API_BASE_URL}/2fa-status/`, {
                method: "GET",
                credentials: "include" // Inclure les cookies
            });

            if (response.ok) {
                const data = await response.json();
                if (data.is_2fa_enabled) {
                    btnChange2FA.textContent = i18next.t("settings.deactivate_2fa_button");
                    const code2fa = document.getElementById("code_2fa");
                    const div2fa = document.getElementById("div_2fa");
                    if (code2fa)
                        code2fa.required = true;
                    if (div2fa)
                        div2fa.hidden = false;
                } else {
                    btnChange2FA.textContent = i18next.t("settings.activate_2fa_button");
                }
            } else if (response.status === 401) {
                // Session expirée
                alert(i18next.t("settings.session_expired"));
                router.navigate('logout');
            } else {
                console.error("Erreur lors de la vérification du statut 2FA.");
            }
        } catch (error) {
            console.error("Erreur lors de la vérification du statut 2FA:", error);
        }
    }


    function toggle2FAForm() {
        settingsContent.innerHTML = `
            <form id="toggle-2fa-form" class="retro-form">
                <h3 data-i18n="settings.toggle_2fa_title">Validation 2FA</h3>
                <img src="/media/avatars/default-avatar.png" id="qr-image" hidden>
                <div class="mb-3">
                    <label for="authCode" class="form-label" data-i18n="settings.code_2fa_label">Code à 6 Chiffres</label>
                    <input type="text" class="form-control retro-input" id="authCode" name="authCode"
                        data-i18n-attr="placeholder" data-i18n-key="settings.code_2fa_placeholder" placeholder="Entrez votre code à 6 chiffres" maxlength="6" pattern="[0-9]{6}" required/>
                </div>
                <div class="d-flex gap-2">
                    <button type="submit" class="retro-button btn-primary" data-i18n="settings.validate_button">Valider</button>
                    <button type="button" id="cancel-toggle-2fa" class="retro-button btn-secondary" data-i18n="settings.cancel_button">Annuler</button>
                </div>
            </form>
        `;

        // Appliquer les traductions
        applyTranslations(settingsContent);

        if (btnChange2FA.textContent === i18next.t("settings.activate_2fa_button")) {
            fetch(`${API_BASE_URL}/2fa-qr-gen/`, {
                method: "GET",
                credentials: "include" // Inclure les cookies
            })
            .then(response => {
                if (response.ok) {
                    return response.blob(); // blob is binary data
                } else if (response.status === 401) {
                    // Session expirée
                    alert(i18next.t("settings.session_expired"));
                    router.navigate('logout');
                    throw new Error('Unauthorized');
                } else {
                    throw new Error(i18next.t("settings.qr_code_generation_error"));
                }
            })
            .then(blob => {
                const imgURL = URL.createObjectURL(blob);
                document.getElementById('qr-image').src = imgURL;
                document.getElementById("qr-image").hidden = false;
            })
            .catch(error => {
                console.error('Erreur lors de la génération du QR code 2FA:', error);
                settingsContent.innerHTML = "";
                showMessage(settingsContent, 'settings.qr_code_generation_error', 'danger');
            });
        }

        const toggle2FAForm = document.getElementById("toggle-2fa-form");
        const cancelButton = document.getElementById("cancel-toggle-2fa");

        toggle2FAForm.addEventListener("submit", async function(event) {
            event.preventDefault();
            const codeDigit = document.getElementById("authCode").value.trim();

            // Validation du code 2FA
            if (!/^\d{6}$/.test(codeDigit)) {
                showMessage(settingsContent, "settings.invalid_code", "danger");
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/toggle2fa/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include", // Inclure les cookies
                    body: JSON.stringify({ code: codeDigit })
                });

                if (response.ok) {
                    showMessage(settingsContent, "settings.2fa_toggle_success", "success");
                    check2FAStatus();
                } else if (response.status === 401) {
                    // Session expirée
                    alert(i18next.t("settings.session_expired"));
                    router.navigate('logout');
                } else if (response.status === 417) {
                    // Code invalide
                    showMessage(settingsContent, "settings.invalid_code", "danger");
                } else {
                    // Autres erreurs
                    const result = await response.json();
                    const error = result.detail || i18next.t("settings.2fa_toggle_error");
                    showMessage(settingsContent, error, "danger");
                }
            } catch (error) {
                console.error("Erreur:", error);
                showMessage(settingsContent, "settings.unexpected_error", "danger");
            }
        });

        cancelButton.addEventListener("click", () => {
            settingsContent.innerHTML = "";
        });
    }


    check2FAStatus();

    // Ajout des écouteurs d'événements
    if (btnChangeUsername) {
        btnChangeUsername.addEventListener("click", loadChangeUsernameForm);
    }

    if (btnChangePassword) {
        btnChangePassword.addEventListener("click", loadChangePasswordForm);
    }

    if (btnDeleteAccount) {
        btnDeleteAccount.addEventListener("click", deleteAccount);
    }

    if (btnChange2FA) {
        btnChange2FA.addEventListener("click", toggle2FAForm);
    }
}
