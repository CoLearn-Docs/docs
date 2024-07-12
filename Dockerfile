# build step
FROM node:20 AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install
COPY . .

RUN pnpm docs:build

# release step
FROM nginx:1.10.3

EXPOSE 8005

RUN ls -al /app/docs

COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/docs/dist /usr/share/nginx/html