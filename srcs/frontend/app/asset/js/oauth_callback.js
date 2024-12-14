// /asset/js/oauth_callback.js

import { router } from './router.js';
export function initOAuthCallback() {
    const API_BASE_URL = '/users'; // URL de base de l'API

    // Faire une requête au backend pour récupérer les informations OAuth
    fetch(`${API_BASE_URL}/get_oauth_info/`, {
        method: 'GET',
        credentials: 'include' // Inclure les cookies HttpOnly
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des informations OAuth.');
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            alert(data.error);
            window.location.hash = '#/login';
            return;
        }

        const userExists = data.user_exists === true || data.user_exists === 'true';

        if (userExists) {
            window.location.hash = '#/connect42';
        } else {
            window.location.hash = '#/register42';
        }
    })
    .catch(error => {
        console.error('Erreur lors de la récupération des informations OAuth :', error);
        alert('Une erreur est survenue lors de la récupération des informations OAuth.');
        window.location.hash = '#/login';
    });
}

// Initialiser le traitement OAuth
initOAuthCallback();
