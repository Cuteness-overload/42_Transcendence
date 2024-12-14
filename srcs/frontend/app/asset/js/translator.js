// /asset/js/translator.js

export function initI18next() {
    const savedLanguage = localStorage.getItem('language') || 'fr'; // Langue par défaut : français
    return new Promise((resolve, reject) => {
        i18next
            .use(i18nextHttpBackend)
            .init({
                lng: savedLanguage, // Utiliser la langue sauvegardée ou la langue par défaut
                fallbackLng: 'fr',
                debug: false,
                backend: {
                    loadPath: '/asset/locales/{{lng}}/translation.json',
                },
                interpolation: {
                    escapeValue: false,
                }
            }, (err, t) => {
                if (err) {
                    console.error('Erreur lors de l\'initialisation d\'i18next:', err);
                    reject(err);
                } else {
                    console.log('i18next initialisé avec succès.');
                    resolve();
                }
            });
    });
}

export function applyTranslations(container = document) {
    // Traduire les éléments avec l'attribut data-i18n
    const elements = container.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = i18next.t(key);
    });

    // Traduire les attributs avec data-i18n-attr et data-i18n-key
    const attrElements = container.querySelectorAll('[data-i18n-attr]');
    attrElements.forEach(element => {
        const attr = element.getAttribute('data-i18n-attr');
        const key = element.getAttribute('data-i18n-key') || element.getAttribute('data-i18n');
        if (key) {
            element.setAttribute(attr, i18next.t(key));
        }
    });
}

export function changeLanguage(lng) {
    i18next.changeLanguage(lng, (err, t) => {
        if (err) {
            console.error('Erreur lors du changement de langue:', err);
        } else {
            localStorage.setItem('language', lng); // Enregistrer la langue sélectionnée
            applyTranslations(); // Appliquer les traductions globalement
        }
    });
}

//export { i18next };
