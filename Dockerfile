FROM oven/bun:1.2.17

WORKDIR /app

# Copy package.json files first for better caching
COPY package.json bun.lock ./
COPY web-ui/package.json web-ui/bun.lock ./web-ui/

# Install dependencies
RUN cd web-ui && bun install

# Copy the rest of the application
COPY . .

# Build the application
RUN cd web-ui && bun run build

CMD ["bun", "run", "start"]