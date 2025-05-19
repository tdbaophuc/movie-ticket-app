# Hướng đẫn clone dự án và Demo
***
## Bước 1: Clone dự án về máy
- `git clone https://github.com/tdbaophuc/movie-ticket-app.git`
- `cd movie-ticket-app`
  ***
## Bước 2: Cài đặt và khởi chạy Backend:
- `cd movie-ticket-app-backend`
- `npm install`
- Tải và cài đặt MongoDB nếu chưa có
- Thêm MongoDB vào biến môi trường trong máy tính nếu chưa thêm
- Tạo file .env:
  - PORT=5000
  - MONGO_URI=mongodb://127.0.0.1:27017/movie_ticket_db
  - JWT_SECRET="mã khoá tuỳ chỉnh cho JWT"
  - JWT_REFRESH_SECRET="mã khoá tuỳ chỉnh cho JWT(khác cái ở trên)"
  - EMAIL_USER="gmail để gửi thông báo từ hệ thống"
  - EMAIL_PASS="mật khẩu ứng dụng của gmail đó"
- `npm run dev`
  ***
## Bước 3: Cài đặt và khởi chạy Frontend mobile (React Native App - DNC Cinemas)
- ở thư mục dự án: `cd dnc-cinemas`
- `npm install`
- cập nhật URL trong: dnc-cinemas/src/utils/api.js: `http://<ip của máy>:5000/api`( trước hết phải bỏ chặn tường lửa đối với Port: 5000)
- `npx expo start` (có thể sử dụng điện thoại ios hoặc android tải app Expo Go rồi quét mã qr trong terminal sao khi khởi chạy để chạy ứng dụng trên điện thoại thật)
  ***
## Bước 4: Cài đặt và khởi chạy Frontend web admin dashboard(Next.js)  
- ở thư mục dự án: `cd dnc-admin-dashboard`
- `npm install`
- cập nhật URL trong: dnc-admin-dashboard/src/utils/api.ts: `http://<ip của máy>:5000/api`( trước hết phải bỏ chặn tường lửa đối với Port: 5000)
- `npm run dev` ( sau đó mở trình duyệt với URL: `http://localhost:3000`)
  
