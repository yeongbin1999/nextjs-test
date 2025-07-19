import { Order } from '../types';
import { statusColor } from '../statusColor';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { Coffee } from 'lucide-react';

export function OrderCard({ order }: { order: Order }) {
  return (
    <Card className="p-6 bg-white/80 border-amber-100 shadow-lg rounded-2xl h-full flex flex-col justify-between">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
        <div className="text-brown-900 font-semibold">주문번호: {order.id}</div>
        <div className="text-brown-700 text-sm">{order.date}</div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor[order.status] || 'bg-gray-100 text-gray-500'}`}>{order.status}</span>
      </div>
      <ul className="text-brown-800 text-base mb-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
        {order.items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <Coffee className="w-4 h-4 text-amber-400" />
            <span>{item.name}</span>
            <span className="text-xs text-brown-400 ml-1">x{item.qty}</span>
          </li>
        ))}
      </ul>
      <div className="text-right text-brown-900 font-bold text-lg">총액: {order.total.toLocaleString()}원</div>
    </Card>
  );
} 