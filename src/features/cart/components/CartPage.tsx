'use client';

import { useCartStore } from '@/features/cart/cartStore';
import Image from 'next/image';
import { useState } from 'react';
import React from 'react';

export function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();
  const subtotal = getTotalPrice();
  const [quantities, setQuantities] = useState(() => Object.fromEntries(items.map(item => [item.id, item.quantity])));

  // items가 바뀔 때마다 quantities 동기화
  React.useEffect(() => {
    setQuantities(Object.fromEntries(items.map(item => [item.id, item.quantity])));
  }, [items]);

  return (
    <div className="flex flex-col md:flex-row gap-8 p-8 min-h-[60vh]">
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
                        src={item.image_url}
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
                      <input
                        type="number"
                        min={1}
                        value={quantities[item.id] ?? item.quantity}
                        onChange={e => {
                          const value = e.target.value;
                          setQuantities(q => ({ ...q, [item.id]: value }));
                        }}
                        onBlur={e => {
                          let value = Number(e.target.value);
                          if (isNaN(value) || value < 1) value = 1;
                          updateQuantity(item.id, value);
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            let value = Number(e.currentTarget.value);
                            if (isNaN(value) || value < 1) value = 1;
                            updateQuantity(item.id, value);
                            e.currentTarget.blur();
                          }
                        }}
                        className="min-w-[3rem] w-16 border rounded text-center py-1 font-mono"
                      />
                    </td>
                    <td className="py-4 px-4 text-right w-36 min-w-[8rem] text-gray-700 text-lg">
                      ₩ {(item.price * item.quantity).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-center w-12">
                      <button
                        onClick={() => removeItem(item.id)}
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
        <div className="flex justify-between mb-2 text-lg">
          <span>Subtotal</span>
          <span className="text-gray-400">₩ {subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between mb-6 text-xl font-semibold">
          <span>Total</span>
          <span className="text-amber-600">₩ {subtotal.toLocaleString()}</span>
        </div>
        <button className="w-full border rounded-lg py-3 text-lg font-semibold hover:bg-gray-100 transition">
          Check Out
        </button>
      </div>
    </div>
  );
} 