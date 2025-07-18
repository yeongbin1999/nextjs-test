'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/features/auth/authStore';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: 'USER' | 'ADMIN';
}

export function RouteGuard({ children, requiredRole }: RouteGuardProps) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // 로그인 상태 확인 중이면 대기
    if (isAuthenticated === undefined) return;
    
    if (!isAuthenticated) {
      // 로그인 없음 → 로그인 페이지로
      router.push(`/login?redirect=${pathname}`);
      return;
    }
    
    if (requiredRole && user?.role !== requiredRole) {
      // 로그인은 했지만 권한 부족 → 접근 거부 페이지
      router.push('/access-denied');
      return;
    }
  }, [isAuthenticated, user?.role, requiredRole, router, pathname]);
  
  // 로딩 상태
  if (isAuthenticated === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">권한을 확인하는 중...</p>
        </div>
      </div>
    );
  }
  
  // 로그인 필요
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">로그인이 필요합니다...</p>
        </div>
      </div>
    );
  }
  
  // 권한 부족
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">권한을 확인하는 중...</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
} 