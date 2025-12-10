FROM node:22 AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build   # génère ./build selon ton vite.config.ts

FROM alpine:3.19

WORKDIR /app

COPY --from=builder /app/build ./build

CMD ["sh", "-c", "echo 'Build ready'"]
