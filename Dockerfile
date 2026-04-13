FROM node:22

# Install dependencies (DEBIAN, bukan alpine)
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-driver \
    fonts-freefont-ttf \
    libnss3 \
    libfreetype6 \
    libharfbuzz0b \
    ca-certificates \
    python3 \
    python3-pip \
    make \
    g++ \
    build-essential \
    dbus \
    && rm -rf /var/lib/apt/lists/*

# Environment Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

COPY package*.json ./

RUN npm install

# socket.io biasanya sudah di package.json → ini opsional
# RUN npm install socket.io

COPY . .

EXPOSE 4000

CMD ["node", "server.js"]
