FROM node:20

# Optional: If you need native dependencies like Prisma
# RUN apt-get update && apt-get install -y python3 make g++

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma

RUN npm install

COPY . .

# Build the Next.js app
RUN npm run azure-build
# RUN npm run build

# Expose the port Next.js will run on
EXPOSE 3000

# Start the Next.js production server
CMD ["npm","run", "start"]
