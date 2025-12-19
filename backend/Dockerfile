# Sử dụng Node.js bản nhẹ (alpine) như tài liệu mẫu
FROM node:18-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy package.json trước để tận dụng cache
COPY package.json ./

# Cài đặt thư viện
RUN npm install

# Copy toàn bộ mã nguồn vào image
COPY . .

# Mở port 3001 (Port server của bạn)
EXPOSE 3001

# Lệnh chạy server (Sửa index.js thành server.js cho đúng code của bạn)
CMD ["node", "server.js"]