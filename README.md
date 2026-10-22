# 🎩 Cờ Tỷ Phú 3D (Monopoly 3D City) - Frontend

Một trải nghiệm Cờ Tỷ Phú 3D trực quan, cao cấp trên nền Web hiện đại lấy cảm hứng từ Monopoly Plus (Ubisoft), được xây dựng bằng **Next.js 16**, **React Three Fiber (Three.js)**, **Tailwind CSS**, và **Colyseus Client**.

---

## ✨ Điểm Nổi Bật (Features)

- **Đồ Họa 3D Sống Động**:
  - Bàn cờ 3D đầy đủ 40 ô chuẩn quốc tế kết hợp địa danh Việt Nam (Hồ Gươm, Landmark 81, Cầu Rồng,...).
  - Quân cờ 3D độc đáo (Xe đua, Du thuyền, Mũ quý tộc, Mèo thần tài,...) với hiệu ứng nhảy cánh cung (Arc Jump).
  - Ánh sáng PBR chân thực, dải màu ACESFilmicToneMapping, Environment phản chiếu kim loại vàng/bạc.
- **Giao Diện Glassmorphism Sang Trọng**:
  - Thiết kế bảng màu Dark Luxury kết hợp Pastel Mint dịu mắt.
  - Thẻ thông tin đất đai, nhà ở, thẻ Khí Vận & Cơ Hội hiệu ứng 3D lật mở mượt mà.
  - Âm thanh tương tác sống động (xúc xắc, tiếng tiền leng keng, còi xe,...).
- **Chế Độ Chơi Đa Dạng**:
  - **Chơi Đơn (Vs AI)**: Chơi cùng bot thông minh ngay trên trình duyệt (Offline/Client logic).
  - **Chơi Online Nhiều Người (Multiplayer)**: Kết nối Authoritative Server thời gian thực qua Colyseus WebSocket.
- **Tùy Biến URL Server Linh Hoạt**:
  - Tự động nhận diện cấu hình môi trường hoặc tham số `?server=wss://...` trên thanh địa chỉ.

---

## 🚀 Cài Đặt & Chạy Cục Bộ (Local Setup)

### 1. Cài đặt thư viện
```bash
npm install
```

### 2. Thiết lập Biến Môi Trường (Environment Variables)
Tạo file `.env.local` dựa trên `.env.example`:
```env
NEXT_PUBLIC_COLYSEUS_URL=ws://localhost:2567
```

### 3. Chạy môi trường Development
```bash
npm run dev
```
Mở trình duyệt tại [http://localhost:3000](http://localhost:3000).

---

## 🏗️ Build & Production

```bash
npm run build
npm start
```

---

## 🌐 Hướng Dẫn Triển Khai Miễn Phí (Vercel)

1. Đẩy mã nguồn lên GitHub: `https://github.com/Vxnat/monopoly-fe.git`.
2. Truy cập [Vercel](https://vercel.com) và chọn **Add New Project**.
3. Import repository `monopoly-fe`.
4. Cấu hình **Environment Variables**:
   - `NEXT_PUBLIC_COLYSEUS_URL`: Điền địa chỉ WebSocket của backend (Ví dụ: `wss://monopoly-be.onrender.com`).
5. Bấm **Deploy**.
