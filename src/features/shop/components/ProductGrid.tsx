'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useProducts } from '@/features/product/hooks/useProducts';
import Link from 'next/link';

export function ProductGrid() {
  const { data: products, isLoading, error } = useProducts();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="w-full max-w-[285px] h-[400px] bg-white rounded-lg animate-pulse"
          >
            <div className="h-[280px] bg-gray-200 rounded-t-lg"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          상품을 불러오는데 실패했습니다
        </h2>
        <p className="text-gray-600">잠시 후 다시 시도해주세요.</p>
      </div>
    );
  }

  if (!products) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {products.map(product => {
        const isNew =
          Date.now() - new Date(product.created_at).getTime() <
          7 * 24 * 60 * 60 * 1000;

        return (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className="block group"
          >
            <Card className="w-full max-w-[285px] h-[400px] overflow-hidden relative hover:shadow-lg hover:shadow-gray-300 hover:scale-[1.02] transition-all duration-200 cursor-pointer">
              {/* 상단 이미지 */}
              <div
                className="relative h-[280px] bg-cover bg-center"
                style={{
                  backgroundImage: `url(${product.image_url || '/placeholder.png'})`,
                }}
              >
                {isNew && (
                  <Badge className="absolute top-0 right-5 bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-medium text-base">
                    NEW
                  </Badge>
                )}
              </div>
              {/* 하단 정보 */}
              <CardContent className="min-h-[120px] p-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 text-2xl leading-[28.8px] line-clamp-2">
                    {product.name}
                  </h3>
                </div>
              </CardContent>
              {/* 가격 */}
              <div className="absolute bottom-2 right-4 text-xl font-semibold text-gray-800 text-right w-full flex justify-end">
                ₩ {product.price.toLocaleString()}
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
