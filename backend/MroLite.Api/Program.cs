using Microsoft.EntityFrameworkCore;
using MroLite.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// =======================
// Services
// =======================

// Controllers
builder.Services.AddControllers();

// DbContext (EF Core + SQL Server)
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// =======================
// Middleware
// =======================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

// =======================
// Endpoints
// =======================

app.MapControllers();

app.Run();
