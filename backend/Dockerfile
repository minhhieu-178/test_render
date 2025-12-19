# 1. Chọn base image
FROM node:18-alpine

# 2. Tạo thư mục làm việc
WORKDIR /app

# 3. Copy file package.json trước để cài thư viện
COPY package.json ./

# 4. Cài đặt dependencies
RUN npm install

# 5. Copy toàn bộ code vào
COPY . .

# 6. Mở port 3001
EXPOSE 3001

# 7. Lệnh chạy server
CMD ["node", "server.js"]