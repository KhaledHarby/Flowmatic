# Multi-stage build for .NET Core API
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files
COPY ["FlowMaster.API/FlowMaster.API.csproj", "FlowMaster.API/"]
COPY ["FlowMaster.Application/FlowMaster.Application.csproj", "FlowMaster.Application/"]
COPY ["FlowMaster.Domain/FlowMaster.Domain.csproj", "FlowMaster.Domain/"]
COPY ["FlowMaster.Infrastructure/FlowMaster.Infrastructure.csproj", "FlowMaster.Infrastructure/"]
COPY ["FlowMaster.Shared/FlowMaster.Shared.csproj", "FlowMaster.Shared/"]

# Restore dependencies
RUN dotnet restore "FlowMaster.API/FlowMaster.API.csproj"

# Copy source code
COPY . .

# Build the application
WORKDIR "/src/FlowMaster.API"
RUN dotnet build "FlowMaster.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "FlowMaster.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app

# Create logs directory
RUN mkdir -p /app/logs

# Copy published application
COPY --from=publish /app/publish .

# Set environment variables
ENV ASPNETCORE_URLS=http://+:80
ENV ASPNETCORE_ENVIRONMENT=Production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

ENTRYPOINT ["dotnet", "FlowMaster.API.dll"]
