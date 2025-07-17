'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/authStore';

export function ProfilePage() {
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwForm, setPwForm] = useState({
    current: '',
    newPw: '',
    confirm: '',
  });
  const [pwError, setPwError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      router.push('/login?redirect=/profile');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (showPwModal) {
      if (pwForm.newPw && pwForm.confirm && pwForm.newPw !== pwForm.confirm) {
        setPwError('새 비밀번호가 일치하지 않습니다.');
      } else {
        setPwError('');
      }
    }
  }, [pwForm, showPwModal]);

  if (!isAuthenticated) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!user) return;
    updateUser({
      ...user,
      name: form.name,
      phone: form.phone,
      address: form.address,
    });
    setEditMode(false);
  };

  const handleCancel = () => {
    setForm({
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || '',
    });
    setEditMode(false);
  };

  // 비밀번호 변경 모달 저장
  const handlePwSave = () => {
    if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) return;
    if (pwForm.newPw !== pwForm.confirm) return;
    // 실제 비밀번호 변경 로직 필요 (API 연동)
    setShowPwModal(false);
    setPwForm({ current: '', newPw: '', confirm: '' });
    setPwError('');
    alert('비밀번호가 변경되었습니다. (실제 저장 로직 필요)');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-white rounded-2xl shadow-2xl p-8 min-w-[500px] max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-8 text-center text-gray-900">
          내 정보
        </h2>
        <div className="space-y-5 mb-12">
          {/* 이메일(아이디) - 항상 읽기 전용 */}
          <div className="flex items-center justify-between gap-4">
            <label className="text-gray-700 font-medium w-24">
              이메일(아이디)
            </label>
            <input
              name="email"
              value={user?.email || ''}
              className="flex-1 border border-gray-200 rounded px-3 py-2 bg-gray-100 text-gray-500 cursor-default"
              type="email"
              readOnly
              disabled
            />
          </div>
          {/* 이름 */}
          <div className="flex items-center justify-between gap-4">
            <label className="text-gray-700 font-medium w-24">이름</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition placeholder:text-gray-400 bg-gray-50 ${!editMode ? 'text-gray-500 cursor-default' : 'text-gray-900'}`}
              type="text"
              readOnly={!editMode}
              disabled={!editMode}
            />
          </div>
          {/* 전화번호 */}
          <div className="flex items-center justify-between gap-4">
            <label className="text-gray-700 font-medium w-24">전화번호</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className={`flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition placeholder:text-gray-400 bg-gray-50 ${!editMode ? 'text-gray-500 cursor-default' : 'text-gray-900'}`}
              type="tel"
              placeholder="010-1234-5678"
              readOnly={!editMode}
              disabled={!editMode}
            />
          </div>
          {/* 기본 배송지 */}
          <div className="flex items-center justify-between gap-4">
            <label className="text-gray-700 font-medium w-24">
              기본 배송지
            </label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              className={`flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition placeholder:text-gray-400 bg-gray-50 ${!editMode ? 'text-gray-500 cursor-default' : 'text-gray-900'}`}
              type="text"
              placeholder="기본 배송지를 입력하세요"
              readOnly={!editMode}
              disabled={!editMode}
            />
          </div>
        </div>
        {/* 비밀번호 변경 버튼과 회원정보 수정 버튼을 같은 줄에 오른쪽 정렬로 */}
        <div className="flex justify-end gap-2 mt-6 mb-2">
          <button
            type="button"
            onClick={() => setShowPwModal(true)}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 text-sm font-semibold shadow-sm transition"
          >
            비밀번호 변경
          </button>
          {editMode ? (
            <>
              <button
                onClick={handleSave}
                className="bg-amber-200 text-amber-900 px-4 py-2 rounded hover:bg-amber-300 text-sm font-semibold shadow-sm transition"
              >
                저장
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 text-sm font-semibold shadow-sm transition"
              >
                취소
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="bg-amber-200 text-amber-900 px-4 py-2 rounded hover:bg-amber-300 text-sm font-semibold shadow-sm transition"
            >
              회원정보 수정
            </button>
          )}
        </div>
        {/* 비밀번호 변경 모달 */}
        {showPwModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.24)' }}
          >
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xs flex flex-col gap-4">
              <h3 className="text-lg font-bold mb-2">비밀번호 변경</h3>
              <input
                type="password"
                name="current"
                value={pwForm.current}
                onChange={e =>
                  setPwForm(f => ({ ...f, current: e.target.value }))
                }
                placeholder="기존 비밀번호"
                className="border rounded px-3 py-2"
              />
              <input
                type="password"
                name="newPw"
                value={pwForm.newPw}
                onChange={e =>
                  setPwForm(f => ({ ...f, newPw: e.target.value }))
                }
                placeholder="새 비밀번호"
                className="border rounded px-3 py-2"
              />
              <input
                type="password"
                name="confirm"
                value={pwForm.confirm}
                onChange={e =>
                  setPwForm(f => ({ ...f, confirm: e.target.value }))
                }
                placeholder="비밀번호 확인"
                className="border rounded px-3 py-2"
              />
              {pwError && (
                <span className="text-red-500 text-xs mt-1">{pwError}</span>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  className="bg-amber-200 text-amber-900 px-3 py-2 rounded hover:bg-amber-300 text-sm font-semibold"
                  onClick={handlePwSave}
                  disabled={
                    !pwForm.current ||
                    !pwForm.newPw ||
                    !pwForm.confirm ||
                    !!pwError
                  }
                >
                  변경
                </button>
                <button
                  className="bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300 text-sm font-semibold"
                  onClick={() => {
                    setShowPwModal(false);
                    setPwForm({ current: '', newPw: '', confirm: '' });
                    setPwError('');
                  }}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
