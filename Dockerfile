FROM node:20

WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package*.json ./
COPY prisma ./prisma

RUN npm install

# Copy source code
COPY . .

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]