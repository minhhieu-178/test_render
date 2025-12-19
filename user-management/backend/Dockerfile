# 1. Chọn môi trường
FROM node:18-alpine

# 2. Thư mục làm việc (đơn giản, dễ nhớ)
WORKDIR /app

# 3. Copy và cài đặt thư viện
COPY package.json ./
RUN npm install

# 4. Copy code vào
COPY . .

# 5. Mở port
EXPOSE 3001

# 6. Chạy trực tiếp file server.js (Tránh phụ thuộc npm start)
CMD ["node", "server.js"]