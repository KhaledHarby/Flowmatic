import type { 
  UserDto, 
  CreateUserDto, 
  UpdateUserDto, 
  AssignTaskDto, 
  ReassignTaskDto, 
  TaskAssignmentDto, 
  UserTaskSummaryDto 
} from '../types/user';

// API Configuration - Update this to match your backend ports
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:51057/api';

class UserService {
  private baseUrl: string;
  private fallbackUrls: string[];
  private currentBaseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.fallbackUrls = [
      'https://localhost:51057/api',
      'http://localhost:51058/api',
    ];
    this.currentBaseUrl = this.normalizeUrl(this.baseUrl);
    console.log('User Service initialized with base URL:', this.currentBaseUrl);
  }

  private normalizeUrl(url: string): string {
    // If the URL is http://localhost:51057/api, force it to https
    if (url.startsWith('http://localhost:51057')) {
      return url.replace('http://', 'https://');
    }
    return url;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt = 0
  ): Promise<T> {
    const url = `${this.currentBaseUrl}${endpoint}`;
    console.log(`Making User API request to (${attempt + 1}/${this.fallbackUrls.length}):`, url);

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      console.log('User API Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => {
          return {};
        });
        const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${response.status}`;
        console.error('User API Error:', errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('User API Response data:', data);
      return data;
    } catch (error) {
      console.error('User API Request failed:', error);
      if (error instanceof TypeError && error.message.includes('fetch') && attempt < this.fallbackUrls.length - 1) {
        console.warn(`Retrying with fallback URL: ${this.fallbackUrls[attempt + 1]}`);
        this.currentBaseUrl = this.fallbackUrls[attempt + 1];
        return this.request(endpoint, options, attempt + 1);
      }
      throw new Error(`Failed to connect to User API. Tried: ${this.fallbackUrls.join(', ')}`);
    }
  }

  // User Management
  async createUser(userData: CreateUserDto): Promise<UserDto> {
    return this.request<UserDto>('/Users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getAllUsers(department?: string, status?: string): Promise<UserDto[]> {
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (status) params.append('status', status);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/Users?${queryString}` : '/Users';
    
    return this.request<UserDto[]>(endpoint);
  }

  async getUserById(id: string): Promise<UserDto> {
    return this.request<UserDto>(`/Users/${id}`);
  }

  async getUserByUsername(username: string): Promise<UserDto> {
    return this.request<UserDto>(`/Users/username/${username}`);
  }

  async updateUser(id: string, userData: UpdateUserDto): Promise<UserDto> {
    return this.request<UserDto>(`/Users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.request<void>(`/Users/${id}`, {
      method: 'DELETE',
    });
  }

  async deactivateUser(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/Users/${id}/deactivate`, {
      method: 'POST',
    });
  }

  async activateUser(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/Users/${id}/activate`, {
      method: 'POST',
    });
  }

  // Task Assignment
  async assignTask(assignData: AssignTaskDto): Promise<{ message: string }> {
    return this.request<{ message: string }>('/Users/tasks/assign', {
      method: 'POST',
      body: JSON.stringify(assignData),
    });
  }

  async reassignTask(reassignData: ReassignTaskDto): Promise<{ message: string }> {
    return this.request<{ message: string }>('/Users/tasks/reassign', {
      method: 'POST',
      body: JSON.stringify(reassignData),
    });
  }

  async unassignTask(taskId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/Users/tasks/${taskId}/unassign`, {
      method: 'POST',
    });
  }

  async getUserTasks(userId: string, status?: string): Promise<TaskAssignmentDto[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/Users/${userId}/tasks?${queryString}` : `/Users/${userId}/tasks`;
    
    return this.request<TaskAssignmentDto[]>(endpoint);
  }

  async getUnassignedTasks(): Promise<TaskAssignmentDto[]> {
    return this.request<TaskAssignmentDto[]>('/Users/tasks/unassigned');
  }

  async getUserTaskSummary(userId: string): Promise<UserTaskSummaryDto> {
    return this.request<UserTaskSummaryDto>(`/Users/${userId}/tasks/summary`);
  }

  async getAllUsersTaskSummary(): Promise<UserTaskSummaryDto[]> {
    return this.request<UserTaskSummaryDto[]>('/Users/tasks/summary');
  }

  async completeTask(taskId: string, result: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/Users/tasks/${taskId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ result }),
    });
  }

  async cancelTask(taskId: string, reason: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/Users/tasks/${taskId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Task Assignment Strategies
  async getNextAvailableUser(department?: string, role?: string): Promise<string | null> {
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (role) params.append('role', role);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/Users/next-available?${queryString}` : '/Users/next-available';
    
    return this.request<string | null>(endpoint);
  }

  async getLeastBusyUser(department?: string, role?: string): Promise<string | null> {
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (role) params.append('role', role);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/Users/least-busy?${queryString}` : '/Users/least-busy';
    
    return this.request<string | null>(endpoint);
  }

  async autoAssignTask(taskId: string, department?: string, role?: string): Promise<{ message: string }> {
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (role) params.append('role', role);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/Users/tasks/${taskId}/auto-assign?${queryString}` : `/Users/tasks/${taskId}/auto-assign`;
    
    return this.request<{ message: string }>(endpoint, {
      method: 'POST',
    });
  }
}

export default new UserService();



