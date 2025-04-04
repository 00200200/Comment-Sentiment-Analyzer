# Use Bun base image
FROM oven/bun:latest

# Install Node.js and npm
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean

# Set the working directory
WORKDIR /app

# Copy only package files first for caching
COPY package.json ./

# Install dependencies using Bun
RUN bun install

# Copy project files into the container
COPY . .


CMD ["bun", "start", "--host"]
