# Base Node.js image with slim profile and LTS version
FROM node:lts-slim

# Set working directory in the Docker container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the local source code to the working directory inside the Docker image
COPY . .

# Compile TypeScript code to JavaScript
RUN npx tsc

# Expose the port the app runs in
EXPOSE 5000

# Command to run the app using compiled JavaScript code
CMD [ "node", "dist/index.js" ]
