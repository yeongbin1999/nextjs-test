import { create } from 'zustand';
import { apiClient } from '@/lib/backend/apiV1/client';
import type {
  LoginRequest,
  SignupRequest,
  UserResponse,
} from '@/lib/backend/apiV1/api';

// 브라우저 환경에서만 localStorage 사용
const isBrowser = typeof window !== 'undefined';

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role?: 'USER' | 'ADMIN';
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // 로그인
  login: (email: string, password: string) => Promise<void>;

  // 회원가입
  register: (
    email: string,
    password: string,
    name: string,
    phone?: string,
    address?: string
  ) => Promise<void>;

  // 로그아웃
  logout: () => void;

  // 사용자 정보 업데이트
  updateUser: (user: User) => void;

  // 인증 상태 확인
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>(set => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });

    try {
      const loginData: LoginRequest = { email, password };
      const response = await apiClient.api.login(loginData);

      // Authorization 헤더에서 토큰 추출
      const authHeader =
        response.headers['authorization'] ||
        response.headers['Authorization'] ||
        response.headers['AUTHORIZATION'];

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        if (isBrowser) {
          localStorage.setItem('accessToken', token);
        }
        console.log('✅ 토큰 저장 완료');
      } else {
        console.error('❌ Authorization 헤더를 찾을 수 없습니다');
      }

      // 로그인 성공 후 checkAuth로 user 상태 최신화
      if (isBrowser) {
        await useAuthStore.getState().checkAuth();
      }
      set({ isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      console.error('로그인 에러:', error);

      // 백엔드에서 반환한 에러 메시지 처리
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error instanceof Error) {
        throw new Error(`로그인에 실패했습니다: ${error.message}`);
      } else {
        throw new Error('로그인에 실패했습니다.');
      }
    }
  },

  register: async (email: string, password: string, name: string) => {
    set({ isLoading: true });

    try {
      const signupData: SignupRequest = { email, password, name };
      await apiClient.api.signup(signupData);

      set({ isLoading: false });
      console.log('✅ 회원가입 성공');
    } catch (error: any) {
      set({ isLoading: false });
      console.error('회원가입 에러:', error);

      // 백엔드에서 반환한 에러 메시지 처리
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error instanceof Error) {
        throw new Error(`회원가입에 실패했습니다: ${error.message}`);
      } else {
        throw new Error('회원가입에 실패했습니다.');
      }
    }
  },

  logout: async () => {
    try {
      await apiClient.api.logout();
      console.log('✅ 로그아웃 성공');
    } catch (error) {
      console.error('로그아웃 에러:', error);
    } finally {
      // 로컬 상태 초기화
      if (isBrowser) {
        localStorage.removeItem('accessToken');
      }
      set({ user: null, isAuthenticated: false });
    }
  },

  updateUser: (user: User) => {
    set({ user });
  },

  checkAuth: async () => {
    try {
      if (!isBrowser) return;

      const token = localStorage.getItem('accessToken');
      if (!token) {
        set({ user: null, isAuthenticated: false });
        return;
      }

      const userResponse = await apiClient.api.getMe();
      const userData = userResponse.data;

      const user: User = {
        id: userData.id || 0,
        email: userData.email || '',
        name: userData.name || '',
        phone: userData.phone,
        address: userData.address,
        role: 'USER',
      };

      set({ user, isAuthenticated: true });
    } catch (error) {
      console.error('인증 확인 에러:', error);
      if (isBrowser) {
        localStorage.removeItem('accessToken');
      }
      set({ user: null, isAuthenticated: false });
    }
  },
}));
