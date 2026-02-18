# --- Build Stage (Frontend) ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Build Stage (Backend) ---
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-builder
WORKDIR /app
COPY backend/*.csproj ./backend/
RUN dotnet restore backend/KortanaStudio.Backend.csproj
COPY backend/ ./backend/
RUN dotnet publish backend/KortanaStudio.Backend.csproj -c Release -o /app/publish

# --- Runtime Stage ---
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Install Official Solidity Native Binary (Static Linux)
RUN apt-get update && apt-get install -y wget ca-certificates \
    && wget -O /usr/bin/solc https://github.com/ethereum/solidity/releases/download/v0.8.20/solc-static-linux \
    && chmod +x /usr/bin/solc \
    && rm -rf /var/lib/apt/lists/*

# Copy Backend
COPY --from=backend-builder /app/publish .

# Copy Frontend Build to the backend's wwwroot
COPY --from=frontend-builder /app/dist ./wwwroot

# Render uses PORT env var - ASP.NET Core 8.0 respects it if configured
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "KortanaStudio.Backend.dll"]
