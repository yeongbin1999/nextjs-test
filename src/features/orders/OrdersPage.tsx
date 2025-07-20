'use client';

import Image from 'next/image';
import { OrderCard } from './components/OrderCard';
import { useQuery } from '@tanstack/react-query';
import { getMyOrders } from './api';
import { useAuthStore } from '@/features/auth/authStore';
import { toast } from 'sonner';

export default function OrdersPage() {
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: getMyOrders,
    enabled: !!user?.id && isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5분
  });

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <div className="text-center text-brown-400 py-12 col-span-full">
          주문 내역을 불러오는 중...
        </div>
      );
    }

    if (error) {
      toast.error('주문 내역을 불러오는데 실패했습니다.');
      return (
        <div className="text-center text-brown-400 py-12 col-span-full">
          주문 내역을 불러오는데 실패했습니다.
        </div>
      );
    }

    if (!orders || orders.length === 0) {
      return (
        <div className="text-center text-brown-400 py-12 col-span-full">
          주문 내역이 없습니다.
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-full py-12 px-4">
      <div className="flex flex-col items-center mb-8">
        <Image
          src="/coffee.jpeg"
          alt="커피"
          width={80}
          height={80}
          className="rounded-full shadow-lg mb-2"
        />
        <h1 className="text-3xl font-bold text-brown-900 mb-2">주문 내역</h1>
        <p className="text-brown-500 text-sm">
          그동안 주문하신 내역을 한눈에 확인하세요 ☕️
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {orders?.map((order: any) => (
          <OrderCard key={order.orderId} order={order} />
        ))}
        {renderEmptyState()}
      </div>
    </div>
  );
}
