import type {
  CreateRoundResponse,
  LoginDto,
  LoginResponse,
  RegisterDto,
  RegisterResponse,
  RoundResponse,
  RoundsListResponse,
  TapResponse,
  User,
} from '../types';
import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

// Create axios instance with proper typing
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const apiError = error as AxiosError<{
      message?: string;
      statusCode?: number;
    }>;
    const message =
      apiError.response?.data?.message ||
      apiError.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  },
);

class ApiService {
  private async fetchWithCredentials(
    url: string,
    options: RequestInit = {},
  ): Promise<Response> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      credentials: 'include', // Include cookies for JWT authentication
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorData: { message: string; error: string; statusCode: number };
      try {
        errorData = (await response.json()) as {
          message: string;
          error: string;
          statusCode: number;
        };
      } catch (error) {
        const apiError = error as {
          response?: { data?: { message?: string; statusCode?: number } };
          message?: string;
        };
        errorData = {
          message:
            apiError.response?.data?.message ||
            apiError.message ||
            'Network error',
          error: 'NETWORK_ERROR',
          statusCode: apiError.response?.data?.statusCode || 500,
        };
      }
      throw new ApiError(
        response.status,
        errorData.message || 'Request failed',
      );
    }

    return response;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = (await response.json()) as {
        message: string;
        error: string;
        statusCode: number;
      };
      throw new ApiError(
        errorData.message || 'Request failed',
        response.status,
      );
    }

    return response.json() as Promise<T>;
  }

  // Authentication endpoints
  async login(credentials: LoginDto): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return response;
  }

  async register(userData: RegisterDto): Promise<RegisterResponse> {
    const response = await this.request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response;
  }

  async logout(): Promise<void> {
    await this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  async getProfile(): Promise<User> {
    const response = await this.request<User>('/auth/profile');
    return response;
  }

  // Rounds endpoints
  async getRounds(): Promise<RoundsListResponse> {
    const response = await this.request<RoundsListResponse>('/rounds');
    return response;
  }

  async getRound(id: string): Promise<RoundResponse> {
    const response = await this.request<RoundResponse>(`/rounds/${id}`);
    return response;
  }

  async createRound(): Promise<CreateRoundResponse> {
    const response = await this.request<CreateRoundResponse>('/rounds', {
      method: 'POST',
    });
    return response;
  }

  async tapRound(roundId: string): Promise<TapResponse> {
    const response = await this.request<TapResponse>(`/rounds/${roundId}/tap`, {
      method: 'POST',
    });
    return response;
  }
}

export const apiService = new ApiService();
export { ApiError };
