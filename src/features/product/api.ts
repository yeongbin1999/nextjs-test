import { Product } from './types';

// API 응답 데이터 타입 정의
interface ProductApiResponse {
  id: number;
  name: string;
  description?: string;
  price: string | number;
  image_url?: string;
  stock?: number;
  created_at?: string;
  updated_at?: string;
  category_id?: number;
}

function mapToProduct(item: ProductApiResponse): Product {
  return {
    id: item.id,
    name: item.name,
    description: item.description ?? '',

    // 문자열 가격 → 숫자 변환
    price:
      typeof item.price === 'string'
        ? parseInt(item.price.replace(/[^0-9]/g, ''))
        : (item.price ?? 0),

    // ✅ dummyData의 image_url 그대로 사용
    image_url: item.image_url || '/placeholder.png',

    // ✅ dummyData에 있으면 그대로 사용, 없으면 기본값
    stock: item.stock ?? 10,
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || new Date().toISOString(),
    category_id: item.category_id ?? 1,
  };
}

// 함수를 export하여 사용할 수 있도록 함
export { mapToProduct };
