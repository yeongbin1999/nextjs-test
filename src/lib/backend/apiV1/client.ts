import { Api } from './api';
import type {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';

// 브라우저 환경에서만 localStorage 사용
const isBrowser = typeof window !== 'undefined';

// API 클라이언트 인스턴스 생성
export const apiClient = new Api({
  baseURL: '', // Next.js 프록시를 통해 요청 (상대 경로 사용)
  withCredentials: true, // 쿠키 기반 인증을 위해 필요
});

// 초기 설정 로깅
console.log('🔧 API 클라이언트 설정:', {
  baseURL: apiClient.instance.defaults.baseURL,
  isBrowser,
  withCredentials: apiClient.instance.defaults.withCredentials,
});

// JWT 토큰을 자동으로 헤더에 추가하는 인터셉터
apiClient.instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 요청 URL 로깅
    console.log('🚀 API 요청:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: (config.baseURL || '') + (config.url || ''),
      headers: config.headers,
    });

    if (isBrowser) {
      const token = localStorage.getItem('accessToken');

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  }
);

// 응답 인터셉터 (토큰 만료 시 처리 및 새로운 토큰 저장)
apiClient.instance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 응답 로깅
    console.log('✅ API 응답:', {
      status: response.status,
      url: response.config.url,
      headers: response.headers,
    });

    // 응답에서 새로운 Authorization 헤더가 있으면 저장
    const accessToken = response.headers['authorization']?.replace(
      'Bearer ',
      ''
    );
    if (accessToken && isBrowser) {
      localStorage.setItem('accessToken', accessToken);
    }

    return response;
  },
  (error: AxiosError) => {
    // 에러 로깅
    console.log('❌ API 에러:', {
      status: error.response?.status,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: (error.config?.baseURL || '') + (error.config?.url || ''),
      message: error.message,
      response: error.response?.data,
    });

    if (
      error.response?.status === 401 &&
      isBrowser &&
      typeof window !== 'undefined' &&
      window.location.pathname !== '/login'
    ) {
      // 토큰 만료 시 로그아웃 처리 (단, 현재 경로가 /login이 아닐 때만)
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
