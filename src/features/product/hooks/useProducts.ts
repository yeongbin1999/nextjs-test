import { useQuery } from '@tanstack/react-query';
import { productData } from '@/features/product/dummyData';
import { mapToProduct } from '@/features/product/api';
import { Product } from '@/features/product/types';

// 상품 목록 조회
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<Product[]> => {
      // 실제 API 호출을 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500));
      return productData.map(mapToProduct);
    },
    staleTime: 1000 * 60 * 5, // 5분
  });
}

// 개별 상품 조회
export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async (): Promise<Product> => {
      // 실제 API 호출을 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 300));
      const productId = Number(id);
      const raw = productData.find(p => p.id === productId);
      if (!raw) {
        throw new Error('Product not found');
      }
      return mapToProduct(raw);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10분
  });
}
