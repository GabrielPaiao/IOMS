import api from './api';
import type { User } from '../types/user';

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'KEY_USER' | 'DEV';
  companyId?: string;
}

export interface InviteUserRequest {
  email: string;
  role: 'ADMIN' | 'KEY_USER' | 'DEV';
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  id: string;
}

class UsersService {
  async getUsers(companyId?: string): Promise<User[]> {
    const response = await api.get<User[]>('/users/company', { params: { companyId } });
    return response.data;
  }

  async getUserById(id: string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await api.post<User>('/users', data);
    return response.data;
  }

  async updateUser(id: string, data: Partial<CreateUserRequest>): Promise<User> {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  }

  async inviteUser(data: InviteUserRequest): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/users/invite', data);
    return response.data;
  }

  async registerWithToken(token: string, userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<User> {
    const response = await api.post<User>(`/users/register/${token}`, userData);
    return response.data;
  }

  async acceptInvitation(token: string, password: string): Promise<User> {
    const response = await api.post<User>(`/users/register/${token}`, {
      password,
    });
    return response.data;
  }

  async getMyApplications(): Promise<any[]> {
    const response = await api.get('/users/me/applications');
    return response.data;
  }

  async updateProfile(data: Partial<CreateUserRequest>): Promise<User> {
    const response = await api.put<User>('/users/me', data);
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/users/me/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  }
}

export const usersService = new UsersService();
export default usersService; 