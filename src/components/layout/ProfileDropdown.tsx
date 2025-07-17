'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, LogIn, UserPlus, LogOut, Settings } from 'lucide-react';
import {
  Dropdown,
  DropdownItem,
  DropdownSeparator,
} from '@/components/ui/dropdown';
import { Tooltip } from '@/components/ui/tooltip';
import { useAuthStore } from '@/features/auth/authStore';

export function ProfileDropdown() {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated) {
    return (
      <Dropdown trigger={<User className="w-5 h-5" />} className="bg-white">
        {({ onClose }) => <>
          <DropdownItem onClick={(e, close) => { login('verylongemailaddress@example.com', 'password'); if (close) close(); }}>
            <div className="flex items-center space-x-2">
              <LogIn className="w-4 h-4" />
              <span>임시 로그인</span>
            </div>
          </DropdownItem>
          <DropdownItem onClick={(e, close) => { setIsLoginModalOpen(true); if (close) close(); }}>
            <div className="flex items-center space-x-2">
              <LogIn className="w-4 h-4" />
              <span>로그인</span>
            </div>
          </DropdownItem>
          <DropdownItem onClick={(e, close) => { if (close) close(); }}>
            <Link href="/register" className="flex items-center space-x-2">
              <UserPlus className="w-4 h-4" />
              <span>회원가입</span>
            </Link>
          </DropdownItem>
        </>}
      </Dropdown>
    );
  }

  return (
    <Dropdown
      trigger={
        <div className="flex items-center space-x-1">
          <User className="w-5 h-5" />
        </div>
      }
      className="bg-white"
    >
      {({ onClose }) => <>
        <div className="px-4 py-2 border-b border-gray-200">
          <Tooltip content={user?.name || ''}>
            <div className="text-sm font-medium text-gray-900 truncate overflow-hidden text-ellipsis whitespace-nowrap">
              {user?.name}
            </div>
          </Tooltip>
          <Tooltip content={user?.email || ''}>
            <div className="text-xs text-gray-500 truncate overflow-hidden text-ellipsis whitespace-nowrap">
              {user?.email}
            </div>
          </Tooltip>
        </div>
        <DropdownItem onClick={(e, close) => { if (close) close(); }}>
          <Link href="/profile" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>내 정보</span>
          </Link>
        </DropdownItem>
        <DropdownSeparator />
        <DropdownItem onClick={(e, close) => { handleLogout(); if (close) close(); }}>
          <div className="flex items-center space-x-2 text-red-600">
            <LogOut className="w-4 h-4" />
            <span>로그아웃</span>
          </div>
        </DropdownItem>
      </>}
    </Dropdown>
  );
}
