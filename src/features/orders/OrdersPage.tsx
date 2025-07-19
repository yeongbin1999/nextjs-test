import Image from 'next/image';
import { orders } from './dummyData';
import { OrderCard } from './components/OrderCard';

export default function OrdersPage() {
  return (
    <div className="w-full py-12 px-4">
      <div className="flex flex-col items-center mb-8">
        <Image src="/coffee.jpeg" alt="커피" width={80} height={80} className="rounded-full shadow-lg mb-2" />
        <h1 className="text-3xl font-bold text-brown-900 mb-2">주문 내역</h1>
        <p className="text-brown-500 text-sm">그동안 주문하신 내역을 한눈에 확인하세요 ☕️</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
        {orders.length === 0 && (
          <div className="text-center text-brown-400 py-12 col-span-full">주문 내역이 없습니다.</div>
        )}
      </div>
    </div>
  );
} 