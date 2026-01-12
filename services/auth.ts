import { User } from '../types';

interface LoginData {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  password: string;
  fullName: string;
  email: string;
  country?: string;
  subscription_plan?: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export const auth = {
  async login(data: LoginData): Promise<User> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const user = await response.json();

    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userId', user.id);

    return user;
  },

  async register(data: RegisterData): Promise<User> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const user = await response.json();

    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userId', user.id);

    return user;
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
  },

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }
};
