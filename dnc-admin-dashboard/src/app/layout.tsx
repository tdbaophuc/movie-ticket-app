'use client'; // Thêm dòng này để đánh dấu file là Client Component

import AdminLayout from '@/components/layout/AdminLayout';
import { usePathname } from 'next/navigation'; // Sử dụng usePathname thay vì useRouter
import './globals.css';
import { ReactNode } from 'react';


export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname(); // Lấy đường dẫn hiện tại
  const isLoginPage = pathname === '/login'; // Kiểm tra xem đây có phải là trang login không

  return (
    <html lang="en">
      <body>
        {/* Nếu không phải trang login, mới render AdminLayout */}
        {!isLoginPage ? (
          <AdminLayout>{children}</AdminLayout>
        ) : (
          // Nếu là trang login, chỉ render form login mà không có layout
          <>{children}</>
        )}
      </body>
    </html>
  );
}
