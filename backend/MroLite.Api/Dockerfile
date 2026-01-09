FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY MroLite.Api/MroLite.Api.csproj MroLite.Api/
RUN dotnet restore MroLite.Api/MroLite.Api.csproj

COPY . .
WORKDIR /src/MroLite.Api
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "MroLite.Api.dll"]
