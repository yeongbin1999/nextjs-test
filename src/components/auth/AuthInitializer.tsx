'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/authStore';

export function AuthInitializer() {
  useEffect(() => {
    // 앱 시작 시 자동으로 인증 상태 확인
    useAuthStore.getState().checkAuth();
  }, []);

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null;
}
