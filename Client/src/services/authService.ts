import type { TokenChangeCallback } from '../types';

/**
 * Singleton auth service - single source of truth for authentication token
 */

const TOKEN_KEY = 'authToken';
const listeners = new Set<TokenChangeCallback>();

// In-memory token cache (synced with localStorage)
let cachedToken: string | null = localStorage.getItem(TOKEN_KEY);

interface AuthServiceType {
  getToken(): string | null;
  setToken(token: string | null): void;
  clearToken(): void;
  isAuthenticated(): boolean;
  onTokenChange(callback: TokenChangeCallback): () => void;
  _notifyListeners(): void;
}

const authService: AuthServiceType = {
  getToken(): string | null {
    return cachedToken;
  },

  setToken(token: string | null): void {
    if (token) {
      cachedToken = token;
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      this.clearToken();
    }
    this._notifyListeners();
  },

  clearToken(): void {
    cachedToken = null;
    localStorage.removeItem(TOKEN_KEY);
    this._notifyListeners();
  },

  isAuthenticated(): boolean {
    return !!cachedToken;
  },

  /**
   * Subscribe to token changes
   * @param callback - Called when token changes
   * @returns Unsubscribe function
   */
  onTokenChange(callback: TokenChangeCallback): () => void {
    listeners.add(callback);
    return () => {
      listeners.delete(callback);
    };
  },

  _notifyListeners(): void {
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
window.addEventListener('storage', (event: StorageEvent) => {
  if (event.key === TOKEN_KEY) {
    cachedToken = event.newValue;
    authService._notifyListeners();
  }
});

export default authService;
