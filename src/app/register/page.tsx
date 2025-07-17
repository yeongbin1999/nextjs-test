import { RegisterForm } from '@/features/auth/components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex flex-1 h-full">
      {/* 좌측: 회원가입 폼 */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Grids & Circles CAFE
          </h1>
          <RegisterForm />
        </div>
      </div>

      {/* 우측: 카페 배경 이미지 */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/bg.png')" }}
        />
      </div>
    </div>
  );
}
