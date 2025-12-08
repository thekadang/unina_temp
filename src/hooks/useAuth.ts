import { useState, useCallback } from 'react';

const AUTH_KEY = 'tour-authenticated';

/**
 * 인증 상태 관리 훅
 * - sessionStorage 기반 인증
 * - 브라우저 탭 종료 시 자동 로그아웃
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // 로그인 처리
  const authenticate = useCallback(() => {
    try {
      sessionStorage.setItem(AUTH_KEY, 'true');
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to save auth state:', error);
    }
  }, []);

  // 로그아웃 처리
  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem(AUTH_KEY);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Failed to clear auth state:', error);
    }
  }, []);

  return {
    isAuthenticated,
    authenticate,
    logout
  };
}
