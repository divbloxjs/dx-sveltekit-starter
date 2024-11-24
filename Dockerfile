FROM node:22

WORKDIR /app

COPY package.json ./

COPY . .

RUN npm ci

RUN npm run build

CMD npx divblox -s accept-all && node ./src/lib/server/boot.js && node build

EXPOSE 3000