import { create } from 'zustand';
import { apiClient } from '@/lib/backend/apiV1/client';
import type { LoginRequest, SignupRequest } from '@/lib/backend/apiV1/api';
import { useCartStore } from '@/features/cart/cartStore';
import { fetchCart, addToCart, updateCartItem } from '@/features/cart/api';
import { queryClient } from '@/components/providers/QueryProvider';

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
        console.log('userId:', userId);
        if (!userId) return; // userId 없으면 동기화 중단

        // 2. 게스트 장바구니와 서버 장바구니 병합
        await mergeGuestCartWithServerCart();

        // 3. React Query cart 쿼리 invalidate
        if (queryClient) {
          queryClient.invalidateQueries({ queryKey: ['cart', userId] });
        }
      }
      set({ isLoading: false });
    } catch (error: unknown) {
      set({ isLoading: false });
      console.error('로그인 에러:', error);

      // 백엔드에서 반환한 에러 메시지 처리
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error as {
          response?: { data?: { message?: string } };
        };
        if (errorResponse.response?.data?.message) {
          throw new Error(errorResponse.response.data.message);
        }
      }
      if (error instanceof Error) {
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
    } catch (error: unknown) {
      set({ isLoading: false });
      console.error('회원가입 에러:', error);

      // 백엔드에서 반환한 에러 메시지 처리
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error as {
          response?: { data?: { message?: string } };
        };
        if (errorResponse.response?.data?.message) {
          throw new Error(errorResponse.response.data.message);
        }
      }
      if (error instanceof Error) {
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
    } catch (error: unknown) {
      console.error('로그아웃 에러:', error);
    } finally {
      // 로컬 상태 초기화
      if (isBrowser) {
        // 서버 items를 sessionStorage(cart-storage)에 저장
        const items = useCartStore.getState().items;
        sessionStorage.setItem(
          'cart-storage',
          JSON.stringify({ state: { items } })
        );
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
    } catch (error: unknown) {
      console.error('인증 확인 에러:', error);
      if (isBrowser) {
        localStorage.removeItem('accessToken');
      }
      set({ user: null, isAuthenticated: false });
    }
  },
}));

// 게스트 장바구니와 서버 장바구니 병합 함수
async function mergeGuestCartWithServerCart() {
  const localCartItems = useCartStore.getState().items; // 게스트 장바구니
  const serverCart = await fetchCart(); // 서버 장바구니

  const serverCartMap = new Map<number, { id: number; quantity: number }>();
  serverCart.forEach(item => {
    serverCartMap.set(Number(item.productId), {
      id: item.id, // cartItemId
      quantity: item.quantity,
    });
  });

  for (const guestItem of localCartItems) {
    const pid = Number(guestItem.productId);
    if (isNaN(pid)) continue; // 잘못된 productId 스킵

    const serverItem = serverCartMap.get(pid);
    if (serverItem) {
      // 서버에 이미 있는 경우 → 수량 합산 후 업데이트
      await updateCartItem({
        itemId: serverItem.id,
        quantity: serverItem.quantity + guestItem.quantity,
      });
    } else {
      // 서버에 없는 경우 → 새로 추가
      await addToCart({
        productId: pid,
        quantity: guestItem.quantity,
      });
    }
  }

  // 병합 완료 후 서버 장바구니 다시 fetch
  const mergedCart = await fetchCart();
  useCartStore.setState({ items: mergedCart });
  sessionStorage.setItem(
    'cart-storage',
    JSON.stringify({ state: { items: mergedCart } })
  );
}
