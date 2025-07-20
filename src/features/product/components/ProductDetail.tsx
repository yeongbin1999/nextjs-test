'use client';

import { useProduct } from '@/features/product/hooks/useProducts';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { useCartStore } from '@/features/cart/cartStore';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addToCart } from '@/features/cart/api';
import { useAuthStore } from '@/features/auth/authStore';

interface ProductDetailProps {
  id: string;
}

export function ProductDetail({ id }: ProductDetailProps) {
  const { data: product, isLoading, error } = useProduct(id);
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const addToCartMutation = useMutation({
    mutationFn: async (vars: {
      productId: number;
      quantity: number;
      name: string;
      price: number;
      image_url: string;
    }) => addToCart(vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      setShowToast(true);
      setQuantity(1);
      setTimeout(() => setShowToast(false), 2000);
    },
  });

  const handleDecrease = () => setQuantity(q => Math.max(1, q - 1));
  const handleIncrease = () => setQuantity(q => q + 1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = Number(e.target.value);
    if (isNaN(value) || value < 1) value = 1;
    setQuantity(value);
  };
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let value = Number(e.target.value);
    if (isNaN(value) || value < 1) value = 1;
    setQuantity(value);
  };
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      let value = Number((e.target as HTMLInputElement).value);
      if (isNaN(value) || value < 1) value = 1;
      setQuantity(value);
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (isAuthenticated) {
      addToCartMutation.mutate({
        productId: product.id,
        quantity,
        name: product.name,
        price: product.price,
        image_url: product.image_url || '/placeholder.png',
      });
    } else {
      addItem(product.id, quantity, {
        name: product.name,
        price: product.price,
        image_url: product.image_url || '/placeholder.png',
      });
      setShowToast(true);
      setQuantity(1);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const renderToast = () => {
    if (!showToast) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="bg-black text-white px-6 py-3 rounded shadow text-lg font-semibold">
          장바구니에 담겼습니다!
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white flex flex-1 flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-[1100px] w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-14 items-center bg-white rounded-2xl">
            <div className="bg-[#FAF4EB] rounded-xl p-8 flex justify-center items-center min-h-[380px] animate-pulse">
              <div className="w-[400px] h-[600px] bg-gray-200 rounded-lg"></div>
            </div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return notFound();
  }

  return (
    <div className="bg-white flex flex-1 flex-col">
      {renderToast()}
      <div className="w-full bg-[#FAF4EB] mt-10 pl-10 h-16 flex items-center justify-start text-gray-500 text-base md:text-lg rounded-xl shadow-sm">
        <div className="flex items-center h-full px-30">
          <span className="text-gray-700 font-medium mr-2">Shop</span>
          <span className="text-gray-700 font-medium mx-2">{'>'}</span>
          <span className="text-gray-700 font-medium">{product.name}</span>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-[1100px] w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-14 items-stretch bg-white rounded-2xl px-4 md:px-12">
          {/* 상품 이미지 */}
          <div className="bg-[#FAF4EB] rounded-xl p-8 flex justify-center items-center min-h-[480px] h-[480px] relative mt-4">
            <Image
              src={
                !product.image_url || product.image_url.startsWith('http')
                  ? '/coffee.jpeg'
                  : product.image_url
              }
              alt={product.name}
              width={400}
              height={600}
              className="object-contain rounded-lg shadow-md"
              priority
            />
          </div>

          {/* 상품 정보 */}
          <div className="flex flex-col justify-between h-[500px] min-h-[500px] self-stretch mt-4 md:pr-16">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 mt-8">
                {product.name}
              </h1>
              <div className="text-gray-600 text-xl md:text-2xl mb-4">
                ₩ {Number(product.price).toLocaleString()}
              </div>
              {/* 설명 */}
              <p className="text-gray-700 text-base md:text-lg mb-8 leading-relaxed">
                {product.description}
              </p>
            </div>
            {/* 수량/장바구니 */}
            <div className="flex items-center space-x-5 mt-4 mb-8">
              <div className="flex items-center border rounded-lg px-4 py-2 text-lg md:text-xl w-40 justify-between">
                <button className="px-2 py-1" onClick={handleDecrease}>
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={handleInputKeyDown}
                  className="px-2 w-20 text-center border-none outline-none bg-transparent appearance-none"
                  style={{
                    MozAppearance: 'textfield',
                    WebkitAppearance: 'none',
                  }}
                />
                <button className="px-2 py-1" onClick={handleIncrease}>
                  +
                </button>
              </div>
              <button
                className="flex-1 border rounded-lg py-3 text-lg md:text-xl font-semibold hover:bg-gray-100 transition"
                onClick={handleAddToCart}
              >
                장바구니
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
