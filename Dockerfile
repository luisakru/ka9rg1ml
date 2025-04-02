FROM node:22.14.0-alpine3.21

WORKDIR /usr/src/app

RUN apk add --no-cache flyway

COPY ["package.json", "package-lock.json", "tsconfig.json", ".env", "./"]

RUN yarn install --frozen-lockfile

COPY ./src ./src

EXPOSE 3000

CMD ["yarn", "start"]