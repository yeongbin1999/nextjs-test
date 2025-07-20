'use client';

import { useCartStore } from '@/features/cart/cartStore';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { flushCartSync } from '@/features/cart/cartStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCart, updateCartItem, removeFromCart } from '@/features/cart/api';
import { useAuthStore } from '@/features/auth/authStore';

function CartSyncOnRouteChange() {
  const pathname = usePathname();
  const prevPath = React.useRef(pathname);
  React.useEffect(() => {
    if (prevPath.current !== pathname) {
      if (flushCartSync) flushCartSync();
      prevPath.current = pathname;
    }
  }, [pathname]);
  return null;
}

function useCartQuery() {
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const items = useCartStore(state => state.items);
  const query = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: fetchCart,
    enabled: !!user?.id && isAuthenticated,
    staleTime: 1000 * 60,
  });
  // 로그인: 서버 데이터, 비로그인: zustand
  return isAuthenticated && query.data ? query.data : items;
}

export function CartPage() {
  const user = useAuthStore(state => state.user);
  const items = useCartQuery();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const updateQuantityZustand = useCartStore(state => state.updateQuantity);
  const removeItemZustand = useCartStore(state => state.removeItem);
  const getTotalPrice = useCartStore(state => state.getTotalPrice);
  const queryClient = useQueryClient();

  // React Query mutation for updateQuantity
  const updateQuantityMutation = useMutation({
    mutationFn: async (vars: { itemId: number; quantity: number }) =>
      updateCartItem(vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
    },
  });
  // React Query mutation for removeItem
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: number) => removeFromCart(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
    },
  });

  const handleUpdateQuantity = (itemId: number, quantity: number) => {
    if (isAuthenticated) {
      updateQuantityMutation.mutate({ itemId, quantity });
    } else {
      updateQuantityZustand(itemId, quantity);
    }
  };
  const handleRemoveItem = (itemId: number) => {
    if (isAuthenticated) {
      removeItemMutation.mutate(itemId);
    } else {
      removeItemZustand(itemId);
    }
  };

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="flex flex-col md:flex-row gap-8 p-8 min-h-[60vh]">
      <CartSyncOnRouteChange />
      {/* Cart Table */}
      <div className="flex-1">
        <h1 className="text-3xl font-bold ml-8 mb-8">Cart</h1>
        <div className="overflow-x-auto rounded-xl shadow-sm">
          <table className="w-full min-w-[600px] bg-white rounded-xl">
            <thead>
              <tr className="bg-[#FAF4EB] text-gray-700 text-lg">
                <th className="py-4 px-4 text-left">Product</th>
                <th className="py-4 px-6 text-right w-32 min-w-[7rem]">
                  Price
                </th>
                <th className="py-4 px-6 text-center w-28 min-w-[6rem]">
                  Quantity
                </th>
                <th className="py-4 px-4 text-right w-36 min-w-[8rem]">
                  Subtotal
                </th>
                <th className="py-4 px-4 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-gray-400 text-xl"
                  >
                    No items in cart.
                  </td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="border-b last:border-b-0">
                    <td className="py-4 px-4 flex items-center gap-4">
                      <Image
                        src={
                          !item.image_url || item.image_url.startsWith('http')
                            ? '/coffee.jpeg'
                            : item.image_url
                        }
                        alt={item.name}
                        width={80}
                        height={80}
                        className="rounded-lg bg-gray-100"
                      />
                      <span className="text-gray-700 font-medium">
                        {item.name}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right w-32 min-w-[7rem] text-gray-600 text-lg">
                      ₩ {Number(item.price).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-center w-28 min-w-[6rem]">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="px-2 py-1 text-lg text-gray-500 hover:text-amber-600 border rounded flex-shrink-0"
                          onClick={() =>
                            handleUpdateQuantity(
                              item.id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          aria-label="Decrease"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={e => {
                            let value = Number(e.target.value);
                            if (isNaN(value) || value < 1) value = 1;
                            handleUpdateQuantity(item.id, value);
                          }}
                          className="min-w-[3rem] w-16 border rounded text-center py-2 font-mono"
                          style={{
                            appearance: 'auto',
                          }}
                        />
                        <button
                          className="px-2 py-1 text-lg text-gray-500 hover:text-amber-600 border rounded flex-shrink-0"
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity + 1)
                          }
                          aria-label="Increase"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right w-36 min-w-[8rem] text-gray-700 text-lg">
                      ₩ {(item.price * item.quantity).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-center w-12">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-amber-600 hover:text-red-500 text-2xl"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Cart Totals */}
      <div className="w-full md:w-96 bg-[#FAF4EB] rounded-xl p-8 h-fit shadow-sm md:ml-8 md:mt-[56px]">
        <h2 className="text-2xl font-bold mb-6">Cart Totals</h2>
        <div className="space-y-4">
          <div className="flex justify-between text-xl font-bold">
            <span>Total:</span>
            <span
              className={
                mounted && subtotal !== 0 ? 'text-gray-900' : 'text-gray-400'
              }
            >
              ₩ {mounted ? subtotal.toLocaleString() : 0}
            </span>
          </div>
        </div>
        <button className="w-full bg-amber-600 text-white py-3 rounded-lg mt-6 hover:bg-amber-700 transition-colors">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
