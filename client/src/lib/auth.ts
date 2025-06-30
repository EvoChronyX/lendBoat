import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthManager {
  private user: User | null = null;
  private token: string | null = null;

  constructor() {
    // Load from localStorage on initialization
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('auth_user');
      
      if (token && user) {
        this.token = token;
        this.user = JSON.parse(user);
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      if (this.token && this.user) {
        localStorage.setItem('token', this.token);
        localStorage.setItem('auth_user', JSON.stringify(this.user));
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('auth_user');
      }
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/login', { email, password });
    const authData: AuthResponse = await response.json();
    
    // Ensure both id and userId are set for compatibility
    this.user = {
      ...authData.user,
      id: authData.user.id || authData.user.userId,
      userId: authData.user.userId || authData.user.id
    };
    this.token = authData.token;
    this.saveToStorage();
    
    return authData;
  }

  async adminLogin(email: string, password: string): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/admin-login', { email, password });
    const authData: AuthResponse = await response.json();
    
    // Ensure both id and userId are set for compatibility
    this.user = {
      ...authData.user,
      id: authData.user.id || authData.user.userId,
      userId: authData.user.userId || authData.user.id
    };
    this.token = authData.token;
    this.saveToStorage();
    
    return authData;
  }

  async signup(userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/signup', userData);
    const authData: AuthResponse = await response.json();
    
    // Ensure both id and userId are set for compatibility
    this.user = {
      ...authData.user,
      id: authData.user.id || authData.user.userId,
      userId: authData.user.userId || authData.user.id
    };
    this.token = authData.token;
    this.saveToStorage();
    
    return authData;
  }

  logout() {
    this.user = null;
    this.token = null;
    this.saveToStorage();
  }

  getUser(): User | null {
    return this.user;
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return this.user !== null && this.token !== null;
  }

  isAdmin(): boolean {
    return this.user?.role === 'admin';
  }

  isOwner(): boolean {
    return this.user?.role === 'owner';
  }

  // Refresh auth state from localStorage
  refreshAuthState() {
    this.loadFromStorage();
  }

  // Add Authorization header to requests
  getAuthHeaders(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }
}

export const authManager = new AuthManager();

// Override apiRequest to include auth headers
const originalApiRequest = apiRequest;
export const authenticatedApiRequest = async (
  method: string,
  url: string,
  data?: unknown
): Promise<Response> => {
  const headers = authManager.getAuthHeaders();
  
  const res = await fetch(url, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
  
  return res;
};
