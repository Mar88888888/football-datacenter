import authService from './authService';

describe('authService', () => {
  beforeEach(() => {
    // Clear localStorage and reset authService state before each test
    localStorage.clear();
    authService.clearToken();
  });

  describe('getToken', () => {
    it('returns null when no token is set', () => {
      expect(authService.getToken()).toBeNull();
    });

    it('returns the token after setToken is called', () => {
      authService.setToken('test-token-123');
      expect(authService.getToken()).toBe('test-token-123');
    });
  });

  describe('setToken', () => {
    it('saves token to localStorage', () => {
      authService.setToken('test-token-123');
      expect(localStorage.getItem('authToken')).toBe('test-token-123');
    });

    it('updates the cached token', () => {
      authService.setToken('first-token');
      authService.setToken('second-token');
      expect(authService.getToken()).toBe('second-token');
    });

    it('calls clearToken when passed null', () => {
      authService.setToken('test-token');
      authService.setToken(null);
      expect(authService.getToken()).toBeNull();
      expect(localStorage.getItem('authToken')).toBeNull();
    });

    it('notifies listeners when token is set', () => {
      const listener = vi.fn();
      authService.onTokenChange(listener);

      authService.setToken('new-token');

      expect(listener).toHaveBeenCalledWith('new-token');
    });
  });

  describe('clearToken', () => {
    it('removes token from localStorage', () => {
      authService.setToken('test-token');
      authService.clearToken();
      expect(localStorage.getItem('authToken')).toBeNull();
    });

    it('sets cached token to null', () => {
      authService.setToken('test-token');
      authService.clearToken();
      expect(authService.getToken()).toBeNull();
    });

    it('notifies listeners with null', () => {
      const listener = vi.fn();
      authService.setToken('test-token');
      authService.onTokenChange(listener);

      authService.clearToken();

      expect(listener).toHaveBeenCalledWith(null);
    });
  });

  describe('isAuthenticated', () => {
    it('returns false when no token is set', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('returns true when token is set', () => {
      authService.setToken('test-token');
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('returns false after token is cleared', () => {
      authService.setToken('test-token');
      authService.clearToken();
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('onTokenChange', () => {
    it('returns an unsubscribe function', () => {
      const listener = vi.fn();
      const unsubscribe = authService.onTokenChange(listener);

      expect(typeof unsubscribe).toBe('function');
    });

    it('listener is called on token changes', () => {
      const listener = vi.fn();
      authService.onTokenChange(listener);

      authService.setToken('token-1');
      authService.setToken('token-2');
      authService.clearToken();

      expect(listener).toHaveBeenCalledTimes(3);
      expect(listener).toHaveBeenNthCalledWith(1, 'token-1');
      expect(listener).toHaveBeenNthCalledWith(2, 'token-2');
      expect(listener).toHaveBeenNthCalledWith(3, null);
    });

    it('unsubscribed listener is not called', () => {
      const listener = vi.fn();
      const unsubscribe = authService.onTokenChange(listener);

      authService.setToken('token-1');
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      authService.setToken('token-2');
      expect(listener).toHaveBeenCalledTimes(1); // Still 1, not called again
    });

    it('multiple listeners are all notified', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      authService.onTokenChange(listener1);
      authService.onTokenChange(listener2);

      authService.setToken('test-token');

      expect(listener1).toHaveBeenCalledWith('test-token');
      expect(listener2).toHaveBeenCalledWith('test-token');
    });
  });
});
