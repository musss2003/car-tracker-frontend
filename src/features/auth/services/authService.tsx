import { UserRole } from '@/features/users';
import { api } from '@/shared/utils/apiService';

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
  const data = await api.post<LoginResponse>(
    '/auth/login',
    {
      username,
      password,
    },
    'authentication'
  );
  localStorage.setItem('accessToken', data.accessToken);
  return {
    status: 200,
    data,
  };
};

export const registerAPI = async (
  email: string,
  username: string,
  password: string
): Promise<RegisterResult> => {
  const data = await api.post<RegisterResponse & { accessToken?: string }>(
    '/auth/register',
    { email, username, password },
    'authentication'
  );
  if (data.accessToken) {
    localStorage.setItem('accessToken', data.accessToken);
  }
  return {
    status: 200,
    data,
  };
};
