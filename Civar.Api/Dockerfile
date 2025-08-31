# 1. Build aşaması
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Proje dosyalarını kopyala ve restore yap
COPY ["Civar.Api/Civar.Api.csproj", "Civar.Api/"]
COPY ["Civar.Application/Civar.Application.csproj", "Civar.Application/"]
COPY ["Civar.Domain/Civar.Domain.csproj", "Civar.Domain/"]
COPY ["Civar.Infrastructure/Civar.Infrastructure.csproj", "Civar.Infrastructure/"]
RUN dotnet restore "Civar.Api/Civar.Api.csproj"

# Tüm dosyaları kopyala ve yayınla
COPY . .
WORKDIR "/src/Civar.Api"
RUN dotnet publish "Civar.Api.csproj" -c Release -o /app/publish

# 2. Çalışma aşaması
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 80
ENTRYPOINT ["dotnet", "Civar.Api.dll"]
