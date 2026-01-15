using Microsoft.EntityFrameworkCore;
using MroLite.Api.Data;
using System.Collections.Generic;
using System.Reflection;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// =======================
// Services
// =======================

// Controllers
builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

// CORS: Primero intenta leer desde configuración (appsettings.json)
// Luego intenta desde variables de entorno (para Railway/Render)
var allowedOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>();
if (allowedOrigins == null || allowedOrigins.Length == 0)
{
    // Intentar leer desde variables de entorno (formato: Cors__Origins__0, Cors__Origins__1, etc.)
    var envOrigins = new List<string>();
    var index = 0;
    while (true)
    {
        var origin = builder.Configuration[$"Cors:Origins:{index}"] ?? 
                     builder.Configuration[$"Cors__Origins__{index}"];
        if (string.IsNullOrEmpty(origin))
            break;
        envOrigins.Add(origin);
        index++;
    }
    if (envOrigins.Count > 0)
    {
        allowedOrigins = envOrigins.ToArray();
    }
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        if (allowedOrigins != null && allowedOrigins.Length > 0)
        {
            policy.WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
        else
        {
            // En desarrollo, permitir todos los origins si no hay configuración
            if (builder.Environment.IsDevelopment())
            {
                policy.AllowAnyOrigin()
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            }
        }
    });
});

// DbContext (EF Core + SQL Server)
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));
});

var app = builder.Build();

// =======================
// Middleware
// =======================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.Logger.LogInformation("ENV: {Environment}", app.Environment.EnvironmentName);
app.Logger.LogInformation("Startup OK");

app.UseHttpsRedirection();

app.UseCors("Frontend");

app.UseAuthorization();

// =======================
// Endpoints
// =======================

app.MapControllers();

app.Run();

public partial class Program { }
