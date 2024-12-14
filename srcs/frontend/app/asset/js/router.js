// /asset/js/router.js

const API_BASE_URL = "/users";
import { initNavbar } from './navbar.js';
import { tournamentState } from './play-tournament.js';
import { applyTranslations, changeLanguage } from './translator.js';

// Constantes pour la gestion multi-onglet
const REFRESH_LOCK_KEY = 'refresh_lock';
const REFRESH_LOCK_EXPIRY = 60 * 1000; // 1 minute
const TOKEN_REFRESHED_KEY = 'token_refreshed';

class Router {
    constructor() {
        if (Router.instance) {
            console.log("Une instance de Router existe déjà, retour de l'instance existante.");
            return Router.instance;
        }
        this.routes = {
            '': '/views/login.html', // URL de base
            '#/login': '/views/login.html',
            '#/logout': '/views/logout.html',
            '#/register': '/views/register.html',
            '#/home': '/views/home.html',
            '#/play': '/views/play-menu.html',
            '#/start-game-2P': '/views/play-2P.html',
            '#/start-game-4P': '/views/play-4P.html',
            '#/start-game-solo': '/views/play-solo.html',
            '#/start-game-tournament': '/views/play-tournament.html',
            '#/profile': '/views/profile.html',
            '#/settings': '/views/settings.html',
            '#/connect42': '/views/connect42.html',
            '#/register42': '/views/register42.html',
            '#/oauth_callback': '/views/oauth_callback.html',
            '#/not-found': '/views/not-found.html'
        };
        this.refreshInterval = null; // Stocker l'ID de l'intervalle pour pouvoir le gérer
        Router.instance = this;
        console.log("Création d'une nouvelle instance de Router.");
        this.oauthInfo = null; // Stocker les informations OAuth
        this.init();
    }

    init() {
        // Écouteur pour les changements d'onglet (synchronisation)
        window.addEventListener('storage', (event) => this.handleStorageEvent(event));

        window.addEventListener('hashchange', () => {
            this.loadRoute(location.hash);
        });

        // Ne pas charger la route ici, cela sera fait dans start()
    }

    navigate(path) {
        if (!path.startsWith('#/')) {
            path = '#/' + path;
        }
        if (this.routes[path]) {
            if (location.hash !== path) {
                location.hash = path;
                tournamentState.isTournamentActive = false;
            } else {
                console.log(`Already on the route ${path}, no need to reload.`);
            }
        } else {
            console.warn('Route inconnue :', path);
            this.loadRoute('#/not-found');
        }
    }

    // Définir les routes spéciales avec leurs conditions d'accès
    specialRoutes = {
        '#/connect42': {
            requiresOAuth: true,
            requiresUser: true,
            redirectTo: '#/register42'
        },
        '#/register42': {
            requiresOAuth: true,
            requiresUser: false,
            redirectTo: '#/login' // Par sécurité, rediriger vers login si OAuth invalide
        }
    };

    // Méthode pour récupérer les informations OAuth
    async fetchOAuthInfo() {
        try {
            const response = await fetch(`${API_BASE_URL}/get_oauth_info/`, {
                method: 'GET',
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                this.oauthInfo = data;
                return data;
            } else {
                console.warn("[ROUTER] OAuth info fetch failed:", response.status);
                this.oauthInfo = null;
                return null;
            }
        } catch (error) {
            console.error("[ROUTER] Error fetching OAuth info:", error);
            this.oauthInfo = null;
            return null;
        }
    }

    async loadRoute(hash) {
        console.log(`[ROUTER] Chargement de la route: ${hash}`);
        const hashWithoutQuery = hash.split('?')[0];
        const route = this.routes[hash] || this.routes['#/not-found'];
        const contentDiv = document.getElementById('app');
        const navbarContainer = document.getElementById('navbar-container');

        // Vérifier si la route est une route spéciale
        if (this.specialRoutes.hasOwnProperty(hashWithoutQuery)) {
            const specialRoute = this.specialRoutes[hashWithoutQuery];
            const oauthData = await this.fetchOAuthInfo();

            if (specialRoute.requiresOAuth && !oauthData) {
                console.warn(`[ROUTER] Accès refusé à ${hashWithoutQuery} : OAuth invalide.`);
                this.navigate('login');
                return;
            }

            if (specialRoute.requiresUser && !oauthData.user_exists) {
                console.warn(`[ROUTER] Accès refusé à ${hashWithoutQuery} : Utilisateur non existant.`);
                this.navigate(specialRoute.redirectTo);
                return;
            }

            // Si les conditions sont remplies, permettre l'accès
            console.log(`[ROUTER] Accès autorisé à la route spéciale ${hashWithoutQuery}.`);
        } else {
            // Routes non spéciales : gestion normale de l'authentification
            const isAuthenticated = await this.isAuthenticated();

            const protectedRoutes = ['#/home', '#/play', '#/profile', '#/settings', '#/start-game-2P', '#/start-game-4P', '#/start-game-solo', '#/start-game-tournament'];
            const publicRoutes = ['#/login', '#/register', '#/connect42', '#/register42', '#/oauth_callback', '#/', '/'];

            // Gestion des URLs de base (e.g., https://localhost:3443/ ou https://localhost:3443/#/)
            if (hash === '' || hash === '#/') {
                if (isAuthenticated) {
                    console.log("Utilisateur déjà authentifié. Redirection vers la page d'accueil.");
                    this.navigate('home');
                    return;
                } else {
                    console.log("Utilisateur non authentifié. Redirection vers la page de login.");
                    this.navigate('login');
                    return;
                }
            }

            // Gestion des routes publiques
            if (publicRoutes.includes(hashWithoutQuery)) {
                if (isAuthenticated) {
                    console.warn("Redirection : L'utilisateur est déjà authentifié et ne devrait pas accéder à cette page.");
                    this.navigate('home');  // Rediriger vers une route protégée
                    return;
                }
            }

            // Gestion de la déconnexion volontaire
            if (hashWithoutQuery === '#/logout') {
                console.log("Utilisateur demande la déconnexion.");
                await this.logout(); // Utiliser la méthode logout
                return;
            }

            // Redirection des utilisateurs non authentifiés vers la page de login pour les routes protégées
            if (protectedRoutes.includes(hashWithoutQuery) && !isAuthenticated) {
                console.warn("Redirection : L'utilisateur n'est pas authentifié.");
                this.navigate('login');
                return;
            }

            // Programmer le rafraîchissement des tokens si authentifié
            if (isAuthenticated && !this.refreshInterval) {
                this.scheduleTokenRefresh();
            }

            // Chargement conditionnel de la navbar pour les routes protégées
            if (protectedRoutes.includes(hashWithoutQuery) && hashWithoutQuery != '#/start-game-2P' && hashWithoutQuery != '#/start-game-4P' && hashWithoutQuery != '#/start-game-solo' && hashWithoutQuery != '#/start-game-tournament') {
                if (!document.getElementById('navbar')) {
                    console.log("[ROUTER] Chargement de la navbar pour une route protégée.");
                    await initNavbar(); // Charge la navbar sur protectedRoutes
                    applyTranslations(navbarContainer);
                }
            } else if (navbarContainer) {
                navbarContainer.innerHTML = ''; // Nettoyer la navbar pour les routes publiques
                console.log("[ROUTER] Navbar nettoyée pour une route publique.");
            }
        }

        try {
            const response = await fetch(route, {
                credentials: 'include' // Inclure les cookies dans la requête
            });
            if (!response.ok) throw new Error(`Failed to load route: ${response.status}`);
            const content = await response.text();
            contentDiv.innerHTML = content;
            applyTranslations(contentDiv); // Appliquer les traductions

            // **Ajouter les écouteurs d'événements aux boutons de langue**
            const languageButtons = contentDiv.querySelectorAll('.language-button');
            languageButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const selectedLang = button.getAttribute('data-lang');
                    changeLanguage(selectedLang);
                    updateActiveLanguageButton(selectedLang);
                });
            });

            updateActiveLanguageButton(i18next.language);

            this.loadScripts(hash);
            console.log(`[ROUTER] Route ${hash} chargée avec succès.`);
        } catch (error) {
            console.error("Failed to load content:", error);
            contentDiv.innerHTML = "<h2>Failed to load the page.</h2>";
        }
    }

    loadScripts(hash) {
        const scriptsToLoad = [];

        if (hash === '' || hash === '#/login') {
            scriptsToLoad.push(import('./login.js').then(module => module.initLogin()));
        } else if (hash === '#/register') {
            scriptsToLoad.push(import('./register.js').then(module => module.initRegister()));
        } else if (hash === '#/logout') {
            scriptsToLoad.push(import('./logout.js').then(module => module.initLogout()));
        } else if (hash === '#/connect42') {
            scriptsToLoad.push(import('./connect42.js').then(module => module.initConnect42()));
        } else if (hash === '#/register42') {
            scriptsToLoad.push(import('./register42.js').then(module => module.initRegister42()));
        } else if (hash === '#/home') {
            scriptsToLoad.push(import('./home.js').then(module => module.initHome()));
        } else if (hash === '#/play') {
            scriptsToLoad.push(import('./play-menu.js').then(module => module.initPlay()));
        } else if (hash === '#/start-game-2P') {
            scriptsToLoad.push(import('./play-2P.js').then(module => module.startGame2P()));
        } else if (hash === '#/start-game-4P') {
            scriptsToLoad.push(import('./play-4P.js').then(module => module.startGame4P()));
        } else if (hash === '#/start-game-solo') {
            scriptsToLoad.push(import('./play-solo.js').then(module => module.startGameSolo()));
        } else if (hash === '#/start-game-tournament') {
            scriptsToLoad.push(import('./play-tournament.js').then(module => module.startGameTournament()));
        } else if (hash === '#/profile') {
            scriptsToLoad.push(import('./profile.js').then(module => module.initProfile()));
        } else if (hash === '#/settings') {
            scriptsToLoad.push(import('./settings.js').then(module => module.initSettings()));
        } else if (hash === '#/oauth_callback') {
            scriptsToLoad.push(import('./oauth_callback.js').then(module => module.initOAuthCallback()));
        } else {
            scriptsToLoad.push(import('./not-found.js').then(module => module.initNotFound()));
        }

        Promise.all(scriptsToLoad).catch(error => {
            console.error("Failed to load scripts:", error);
        });
    }

    async scheduleTokenRefresh() {
        console.log("[ROUTER] Planification du rafraîchissement des tokens.");
        // Rafraîchir toutes les x minutes
        this.refreshInterval = setInterval(() => {
            this.refreshToken();
        }, 1 * 60 * 1000);
    }

    async refreshToken() {
        console.log("[ROUTER] Tentative de rafraîchissement des tokens.");
        const now = Date.now();
        const lock = localStorage.getItem(REFRESH_LOCK_KEY);

        if (lock && (now - parseInt(lock, 10)) < REFRESH_LOCK_EXPIRY) {
            console.log("[ROUTER] Un autre onglet rafraîchit les tokens.");
            return;
        }

        try {
            localStorage.setItem(REFRESH_LOCK_KEY, now.toString());
            console.log("[ROUTER] Début du rafraîchissement des tokens.");

            const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
                method: 'POST',
                credentials: 'include', // Inclure les cookies
            });

            if (response.ok) {
                console.log("[ROUTER] Tokens rafraîchis avec succès.");
                localStorage.setItem(TOKEN_REFRESHED_KEY, Date.now().toString());
            } else {
                console.warn("[ROUTER] Échec du rafraîchissement des tokens.", response.status);
                await this.logout(); // Déconnecter l'utilisateur proprement
            }
        } catch (error) {
            console.error("Erreur lors du rafraîchissement des tokens :", error);
            await this.logout(); // Déconnecter l'utilisateur proprement
        } finally {
            localStorage.removeItem(REFRESH_LOCK_KEY);
            console.log("[ROUTER] Verrou de rafraîchissement des tokens libéré.");
        }
    }

    async isAuthenticated() {
        try {
            const response = await fetch(`${API_BASE_URL}/token/verify-cookie/`, {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                console.log("[ROUTER] Utilisateur authentifié.");
                return true;
            } else {
                console.warn("[ROUTER] Utilisateur non authentifié.");
                return false;
            }
        } catch (error) {
            console.error("Erreur lors de la vérification de l'authentification :", error);
            return false;
        }
    }

    // Fonction pour supprimer les cookies via l'endpoint backend
    async clearCookies() {
        try {
            const response = await fetch(`${API_BASE_URL}/clear-cookies/`, {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                console.log("Cookies supprimés avec succès.");
            } else {
                console.warn("Échec de la suppression des cookies.");
            }
        } catch (error) {
            console.error("Erreur lors de la suppression des cookies :", error);
        }
    }

    // Gestion des événements de stockage pour la synchronisation multi-onglet
    handleStorageEvent(event) {
        if (event.key === TOKEN_REFRESHED_KEY) {
            console.log("Token rafraîchi dans un autre onglet.");
            // Reinitialiser l'intervalle de rafraîchissement si nécessaire
            if (this.refreshInterval) {
                clearInterval(this.refreshInterval);
                this.scheduleTokenRefresh();
            }
        }
    }

    // Méthode principale d'initialisation du routeur
    async initRouter() {
        await this.loadRoute(location.hash || '#/login');
    }

    // Méthode pour démarrer le routeur (appelée depuis app.js)
    async start() {
        console.log("[ROUTER] Démarrage du routeur.");
        await this.initRouter();
    }

    // Méthode à appeler après une connexion réussie
    loginSuccess() {
        if (!this.refreshInterval) {
            this.scheduleTokenRefresh();
            console.log("[ROUTER] Rafraîchissement des tokens programmé après la connexion.");
        }
    }

    // Méthode pour gérer la déconnexion proprement
    async logout() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
            console.log("[ROUTER] Rafraîchissement des tokens arrêté après la déconnexion.");
        }
        await this.clearCookies();
        this.navigate('login');
    }
}

// Fonction pour mettre à jour l'état des boutons de langue
function updateActiveLanguageButton(selectedLang) {
    const languageButtons = document.querySelectorAll('.language-button');
    languageButtons.forEach(button => {
        if (button.getAttribute('data-lang') === selectedLang) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// Exporter l'instance unique de Router
const router = new Router();
export { router };
