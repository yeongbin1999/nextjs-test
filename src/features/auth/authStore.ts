import { create } from 'zustand';

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

  // 인증 상태 확인 (나중에 API로 교체)
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>(set => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });

    try {
      // 임시 로그인 로직 (나중에 API로 교체)
      await new Promise(resolve => setTimeout(resolve, 10)); // API 호출 시뮬레이션

      const user: User = {
        id: 1,
        email: email,
        name: email.split('@')[0], // 임시로 이메일에서 이름 추출
      };

      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw new Error('로그인에 실패했습니다.');
    }
  },

  register: async (email: string, password: string, name: string) => {
    set({ isLoading: true });

    try {
      // 임시 회원가입 로직 (나중에 API로 교체)
      await new Promise(resolve => setTimeout(resolve, 10)); // API 호출 시뮬레이션

      const user: User = {
        id: 1,
        email: email,
        name: name,
      };

      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw new Error('회원가입에 실패했습니다.');
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (user: User) => {
    set({ user });
  },

  checkAuth: async () => {
    // 임시로 항상 로그아웃 상태 (나중에 API로 교체)
    set({ user: null, isAuthenticated: false });
  },
}));
