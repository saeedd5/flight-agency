//backend/program.cs : 
using FlightSearch.API.Application.UseCases;
using FlightSearch.API.Application.UseCases.Auth;
using FlightSearch.API.Application.UseCases.Admin;
using FlightSearch.API.Domain.Interfaces;
using FlightSearch.API.Domain.Entities;
using FlightSearch.API.Infrastructure.Data;
using FlightSearch.API.Infrastructure.Data.Repositories;
using FlightSearch.API.Infrastructure.Identity;
using FlightSearch.API.Infrastructure.Providers;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

using Microsoft.AspNetCore.Localization;
using System.Globalization;
using FlightSearch.API.Infrastructure.Providers;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add Response Caching
builder.Services.AddResponseCaching();
builder.Services.AddMemoryCache();

// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite("Data Source=flightsearch.db"));

// Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ISearchLogRepository, SearchLogRepository>();
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<ISettingRepository, SettingRepository>();
builder.Services.AddScoped<IAirlineRepository, AirlineRepository>();

// Providers - Sabre InstaFlights (real data, no mock)
builder.Services.AddScoped<IFlightSearchProvider, SabreInstaFlightsProvider>();

// Sabre Token Service (for direct API access from frontend)
builder.Services.AddHttpClient<SabreTokenService>();
builder.Services.AddScoped<SabreTokenService>();

// Use Cases
builder.Services.AddScoped<SearchFlightsUseCase>();
builder.Services.AddScoped<LoginUseCase>();
builder.Services.AddScoped<GetUsersUseCase>();
builder.Services.AddScoped<CreateUserUseCase>();
builder.Services.AddScoped<UpdateUserUseCase>();
builder.Services.AddScoped<DeleteUserUseCase>();
builder.Services.AddScoped<GetBookingsUseCase>();
builder.Services.AddScoped<CreateBookingUseCase>();
builder.Services.AddScoped<UpdateBookingStatusUseCase>();
builder.Services.AddScoped<GetSearchLogsUseCase>();
builder.Services.AddScoped<CreateSearchLogUseCase>();
builder.Services.AddScoped<GetSettingsUseCase>();
builder.Services.AddScoped<UpdateSettingUseCase>();
builder.Services.AddScoped<CreateSettingUseCase>();
builder.Services.AddScoped<GetDashboardStatsUseCase>();
builder.Services.AddScoped<GetAirlinesUseCase>();
builder.Services.AddScoped<CreateAirlineUseCase>();
builder.Services.AddScoped<UpdateAirlineUseCase>();
builder.Services.AddScoped<DeleteAirlineUseCase>();
builder.Services.AddScoped<RegisterUseCase>();


// Identity Services
builder.Services.AddScoped<JwtTokenService>();
builder.Services.AddScoped<PasswordHasher>();


builder.Services.AddSingleton<ITranslationService, JsonTranslationService>();

// JWT Authentication
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "your-super-secret-key-change-in-production-min-32-chars";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "FlightSearchAPI";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "FlightSearchClient";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
    };
    
    // Support reading JWT from httpOnly cookie (in addition to Authorization header)
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            // Check if token is in cookie
            if (context.Request.Cookies.ContainsKey("authToken"))
            {
                context.Token = context.Request.Cookies["authToken"];
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// CORS Configuration - Allow credentials for cookie-based auth
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins(
                "http://187.77.219.229:3001"
              )
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Required for cookies
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Initialize database
// Initialize database
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.EnsureCreated();
        // dbContext.Database.Migrate(); 

    // Create admin user if it doesn't exist
    var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
    var passwordHasher = scope.ServiceProvider.GetRequiredService<PasswordHasher>();
    
    var adminUser = userRepository.GetByUsernameAsync("admin").GetAwaiter().GetResult();
    if (adminUser == null)
    {
                var admin = new FlightSearch.API.Domain.Entities.User
            {
                Username = "admin",
                Phone = "admin", // <--- این خط حیاتی را اضافه کنید
                Name = "Administrator", // (این هم برای نمایش نام در پنل خوب است)
                Email = "admin@flightsearch.com",
                PasswordHash = passwordHasher.HashPassword("Admin@123"),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
                    
        admin = userRepository.CreateAsync(admin).GetAwaiter().GetResult();
        userRepository.AddToRoleAsync(admin.Id, FlightSearch.API.Domain.Entities.Role.Admin).GetAwaiter().GetResult();
    }

    // ==========================================
    // کدهای جدید: اضافه کردن درصد سود به دیتابیس
    // ==========================================
    var settingRepository = scope.ServiceProvider.GetRequiredService<ISettingRepository>();
    var markupSetting = settingRepository.GetByKeyAsync(FlightSearch.API.Domain.Entities.Setting.FlightMarkupPercentage).GetAwaiter().GetResult();
    
    if (markupSetting == null)
    {
        var newSetting = new FlightSearch.API.Domain.Entities.Setting
        {
            Key = FlightSearch.API.Domain.Entities.Setting.FlightMarkupPercentage,
            Value = "10", // مقدار پیش‌فرض: 10 درصد
            Description = "Flight Markup Percentage",
            Category = "Pricing"
        };
        settingRepository.CreateAsync(newSetting).GetAwaiter().GetResult();
    }
    // ==========================================
}







// ۳. بعد از var app = builder.Build(); این تنظیمات را قرار دهید:
var supportedCultures = new[] { "en", "ar-IQ" };
var localizationOptions = new RequestLocalizationOptions()
    .SetDefaultCulture("en")
    .AddSupportedCultures(supportedCultures)
    .AddSupportedUICultures(supportedCultures);

// این میدلور هدر Accept-Language را می‌خواند و Culture را تغییر می‌دهد
app.UseRequestLocalization(localizationOptions);












app.UseStaticFiles();

// ساخت پوشه uploads اگر وجود نداشت (این کد از قبل درست بود)
var uploadsPath = Path.Combine(builder.Environment.ContentRootPath, "wwwroot", "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}


app.UseCors("AllowAll");

// Use Response Caching
app.UseResponseCaching();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
