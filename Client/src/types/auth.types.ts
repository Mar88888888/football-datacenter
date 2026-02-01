export interface User {
  id: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  name: string;
}

export type TokenChangeCallback = (token: string | null) => void;

export interface AuthService {
  getToken(): string | null;
  setToken(token: string | null): void;
  clearToken(): void;
  isAuthenticated(): boolean;
  onTokenChange(callback: TokenChangeCallback): () => void;
}

export interface AuthContextValue {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  authToken: string | null;
  saveToken: (token: string) => void;
  logout: () => void;
  loading: boolean;
}
