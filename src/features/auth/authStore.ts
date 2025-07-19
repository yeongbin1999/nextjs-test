import { create } from 'zustand';
import { apiClient } from '@/lib/backend/apiV1/client';
import type {
  LoginRequest,
  SignupRequest,
  UserResponse,
} from '@/lib/backend/apiV1/api';
import { useCartStore } from '@/features/cart/cartStore';
import { fetchCart, clearCart as clearServerCart, addToCart } from '@/features/cart/api';

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

      // 로그인 성공 후 장바구니 동기화
      if (isBrowser) {
        // 1. 인증 상태 최신화(토큰 저장 후 user 정보 fetch)
        await useAuthStore.getState().checkAuth();
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return; // userId 없으면 동기화 중단
        // 2. 서버 장바구니 fetch
        let serverCart: any[] = [];
        try {
          serverCart = await fetchCart();
        } catch (e) {
          serverCart = [];
        }
        // 3. 로컬 장바구니 아이템 가져오기
        const localCartItems = useCartStore.getState().items;
        // 4. 상품ID 기준으로 합치기(수량 합산)
        const mergedMap = new Map();
        for (const item of [...serverCart, ...localCartItems]) {
          if (mergedMap.has(item.id)) {
            mergedMap.set(item.id, {
              ...item,
              quantity: mergedMap.get(item.id).quantity + item.quantity,
            });
          } else {
            mergedMap.set(item.id, { ...item });
          }
        }
        const mergedCart = Array.from(mergedMap.values());
        // 5. 서버 장바구니 비우기
        await clearServerCart();
        // 6. 합쳐진 장바구니를 서버에 모두 추가
        for (const item of mergedCart) {
          try {
            await addToCart({ productId: item.id, quantity: item.quantity });
          } catch (e) {
            // 중복 등 에러 무시하고 계속 진행
            console.warn('장바구니 동기화 실패:', e);
          }
        }
        // 7. zustand 상태도 합쳐진 값으로 set
        useCartStore.setState({ items: mergedCart });
        // 8. localStorage(cart-storage)도 서버 상태로 덮어쓰기
        localStorage.setItem('cart-storage', JSON.stringify({ state: { items: mergedCart } }));
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
        // 서버 items를 localStorage(cart-storage)에 저장
        const items = useCartStore.getState().items;
        localStorage.setItem('cart-storage', JSON.stringify({ state: { items } }));
        localStorage.removeItem('accessToken');
      }
      useCartStore.setState({ items: [] });
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
