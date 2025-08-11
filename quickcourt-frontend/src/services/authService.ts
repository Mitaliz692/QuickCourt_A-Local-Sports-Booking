import apiClient from './api';
import { User } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  role: 'user' | 'facility_owner';
  profilePicture?: File;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
}

export interface VerifyEmailData {
  email: string;
  otp: string;
}

class AuthService {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      
      if (response.data.success && response.data.data) {
        // Store token and user data
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please try again.',
      };
    }
  }

  // Register new user
  async signup(signupData: SignupData): Promise<AuthResponse> {
    try {
      const formData = new FormData();
      formData.append('fullName', signupData.fullName);
      formData.append('email', signupData.email);
      formData.append('password', signupData.password);
      formData.append('confirmPassword', signupData.confirmPassword);
      formData.append('phone', signupData.phone);
      formData.append('role', signupData.role);
      
      if (signupData.profilePicture) {
        formData.append('profilePicture', signupData.profilePicture);
      }

      const response = await apiClient.post('/auth/signup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.',
      };
    }
  }

  // Verify email with OTP
  async verifyEmail(verifyData: VerifyEmailData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/verify-email', verifyData);
      
      if (response.data.success && response.data.data) {
        // Store token and user data after successful verification
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Email verification failed. Please try again.',
      };
    }
  }

  // Resend OTP
  async resendOTP(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post('/auth/resend-otp', { email });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to resend OTP. Please try again.',
      };
    }
  }

  // Logout user
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Get current user from localStorage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // Forgot password
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send reset link. Please try again.',
      };
    }
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        token,
        newPassword,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password reset failed. Please try again.',
      };
    }
  }
}

export default new AuthService();
