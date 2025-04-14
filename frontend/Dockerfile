# Use Bun base image
FROM oven/bun:latest

WORKDIR /app

# Copy package files and install dependencies
COPY bun.lockb package.json ./
RUN bun install

# Copy the rest of the files
COPY . .

# Expose port for Vite
EXPOSE 3000

# Use --host so it listens outside the container
CMD ["bun", "run", "start", "--host"]
