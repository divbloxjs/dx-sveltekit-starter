FROM node:22

WORKDIR /app

COPY package.json ./

COPY . .

RUN npm ci

RUN npm run build

CMD npx divblox -s accept-all skip-pull && node build

EXPOSE 3000