// /asset/js/utils.js

const API_BASE_URL = "/users";

export function displayErrorMessage(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}
