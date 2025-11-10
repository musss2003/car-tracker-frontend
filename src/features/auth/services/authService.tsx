import { UserRole } from '@/features/users';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/api/auth/';

type RegisterResponse = {
  username: string;
  email: string;
  id: string;
  role: UserRole; // or an enum if you've defined one
};

interface RegisterResult {
  status: number;
  data: RegisterResponse;
}

interface LoginResponse {
  accessToken: string;
  username: string;
  email: string;
  id: string;
  role: UserRole;
}

interface LoginResult {
  status: number;
  data: LoginResponse;
}

export const loginAPI = async (
  username: string,
  password: string
): Promise<LoginResult> => {
  try {
    const response = await fetch(API_URL + 'login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error(`Error logging in: ${response.statusText}`);
    }

    const data: LoginResponse = await response.json();

    localStorage.setItem('accessToken', data.accessToken);

    return {
      status: response.status,
      data,
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error; // rethrow so the caller can handle it
  }
};

export const registerAPI = async (
  email: string,
  username: string,
  password: string
): Promise<RegisterResult> => {
  try {
    const response = await fetch(API_URL + 'register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, username, password }),
    });

    if (!response.ok) {
      throw new Error(`Error registering: ${response.statusText}`);
    }

    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);

    return {
      status: response.status,
      data,
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};
