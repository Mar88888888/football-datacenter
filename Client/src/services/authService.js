/**
 * Singleton auth service - single source of truth for authentication token
 */

const TOKEN_KEY = 'authToken';
const listeners = new Set();

// In-memory token cache (synced with localStorage)
let cachedToken = localStorage.getItem(TOKEN_KEY);

const authService = {
  getToken() {
    return cachedToken;
  },

  setToken(token) {
    if (token) {
      cachedToken = token;
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      this.clearToken();
    }
    this._notifyListeners();
  },

  clearToken() {
    cachedToken = null;
    localStorage.removeItem(TOKEN_KEY);
    this._notifyListeners();
  },

  isAuthenticated() {
    return !!cachedToken;
  },

  /**
   * Subscribe to token changes
   * @param {Function} callback - Called when token changes
   * @returns {Function} Unsubscribe function
   */
  onTokenChange(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },

  _notifyListeners() {
    listeners.forEach((callback) => {
      try {
        callback(cachedToken);
      } catch (error) {
        console.error('Error in auth listener:', error);
      }
    });
  },
};

// Sync with other tabs/windows
window.addEventListener('storage', (event) => {
  if (event.key === TOKEN_KEY) {
    cachedToken = event.newValue;
    authService._notifyListeners();
  }
});

export default authService;
