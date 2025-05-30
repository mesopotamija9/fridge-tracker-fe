export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  passwordConfirmation: string;
}

export interface AuthResponse {
  tokens: AuthTokens;
}

export interface User {
  username: string;
} 