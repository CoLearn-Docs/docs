# build step
FROM node:20 AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install
COPY . .

RUN pnpm docs:build

RUN ls -la /app/docs
RUN ls -la /app/docs/.vitepress

# release step
FROM nginx:1.10.3

EXPOSE 8005

COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/docs/.vitepress/dist /usr/share/nginx/html