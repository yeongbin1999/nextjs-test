import {
  CartResponse,
  CartItemResponse,
  AddToCartRequest,
  UpdateCartItemRequest,
  CartItem,
} from './types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// 스프링부트 응답을 클라이언트 타입으로 변환
function mapCartItemResponse(response: CartItemResponse): CartItem {
  return {
    id: response.id,
    name: response.productName,
    price: response.productPrice,
    image_url: response.productImageUrl,
    quantity: response.quantity,
  };
}

// 장바구니 조회
export async function fetchCart(): Promise<CartItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      credentials: 'include', // 쿠키 포함
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cart');
    }

    const cartData: CartResponse = await response.json();
    return cartData.items.map(mapCartItemResponse);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return [];
  }
}

// 장바구니에 상품 추가
export async function addToCart(
  request: AddToCartRequest
): Promise<CartItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to add item to cart');
    }

    const cartData: CartResponse = await response.json();
    return cartData.items.map(mapCartItemResponse);
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

// 장바구니 상품 수량 업데이트
export async function updateCartItem(
  request: UpdateCartItemRequest
): Promise<CartItem[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/cart/items/${request.itemId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ quantity: request.quantity }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update cart item');
    }

    const cartData: CartResponse = await response.json();
    return cartData.items.map(mapCartItemResponse);
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
}

// 장바구니 상품 삭제
export async function removeFromCart(itemId: number): Promise<CartItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to remove item from cart');
    }

    const cartData: CartResponse = await response.json();
    return cartData.items.map(mapCartItemResponse);
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
}

// 장바구니 비우기
export async function clearCart(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to clear cart');
    }
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
}
