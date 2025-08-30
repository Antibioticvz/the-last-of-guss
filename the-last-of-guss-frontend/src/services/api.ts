import {
  ApiError,
  CreateRoundResponse,
  LoginDto,
  LoginResponse,
  RegisterDto,
  RegisterResponse,
  RoundResponse,
  RoundsListResponse,
  TapResponse,
  User,
} from "../types"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
    this.name = "ApiError"
  }
}

class ApiService {
  private async fetchWithCredentials(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      credentials: "include", // Include cookies for JWT authentication
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Network error",
        error: "NETWORK_ERROR",
        statusCode: response.status,
      }))
      throw new ApiError(response.status, errorData.message || "Request failed")
    }

    return response
  }

  // Authentication endpoints
  async login(credentials: LoginDto): Promise<LoginResponse> {
    const response = await this.fetchWithCredentials("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
    return response.json()
  }

  async register(userData: RegisterDto): Promise<RegisterResponse> {
    const response = await this.fetchWithCredentials("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
    return response.json()
  }

  async logout(): Promise<void> {
    await this.fetchWithCredentials("/auth/logout", {
      method: "POST",
    })
  }

  async getProfile(): Promise<User> {
    const response = await this.fetchWithCredentials("/auth/profile")
    return response.json()
  }

  // Rounds endpoints
  async getRounds(): Promise<RoundsListResponse> {
    const response = await this.fetchWithCredentials("/rounds")
    return response.json()
  }

  async getRound(id: string): Promise<RoundResponse> {
    const response = await this.fetchWithCredentials(`/rounds/${id}`)
    return response.json()
  }

  async createRound(): Promise<CreateRoundResponse> {
    const response = await this.fetchWithCredentials("/rounds", {
      method: "POST",
    })
    return response.json()
  }

  async tapRound(roundId: string): Promise<TapResponse> {
    const response = await this.fetchWithCredentials(`/rounds/${roundId}/tap`, {
      method: "POST",
    })
    return response.json()
  }
}

export const apiService = new ApiService()
export { ApiError }
