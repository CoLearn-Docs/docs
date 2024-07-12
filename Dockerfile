# build step
FROM node:20 AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install
RUN ls -al
RUN pwd
COPY . .

RUN ls -al
RUN pnpm docs:build
RUN ls -al
RUN pwd

# release step
FROM nginx:1.10.3

EXPOSE 8005

COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

RUN ls app/docs

COPY --from=builder app/docs/dist /usr/share/nginx/html