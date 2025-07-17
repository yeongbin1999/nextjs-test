import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from './types';

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;

  // 임시 로컬 버전 (나중에 API로 교체)
  addItem: (
    productId: number,
    quantity: number,
    productInfo: Omit<CartItem, 'id' | 'quantity'>
  ) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  removeItem: (itemId: number) => void;
  clearCart: () => void;

  // 계산 함수들
  getTotalCount: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,

      // 임시 로컬 버전 - 나중에 API로 교체
      addItem: (
        productId: number,
        quantity: number,
        productInfo: Omit<CartItem, 'id' | 'quantity'>
      ) => {
        set(state => {
          const existingItem = state.items.find(i => i.id === productId);
          if (existingItem) {
            return {
              ...state,
              items: state.items.map(i =>
                i.id === productId
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return {
            ...state,
            items: [
              ...state.items,
              {
                id: productId,
                quantity,
                ...productInfo,
              },
            ],
          };
        });
      },

      updateQuantity: (itemId: number, quantity: number) => {
        set(state => ({
          items: state.items.map(i =>
            i.id === itemId ? { ...i, quantity } : i
          ),
        }));
      },

      removeItem: (itemId: number) => {
        set(state => ({
          items: state.items.filter(i => i.id !== itemId),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'cart-storage', // localStorage 키 이름
      partialize: state => ({ items: state.items }), // items만 저장
      skipHydration: true, // Hydration Error 방지
    }
  )
);
