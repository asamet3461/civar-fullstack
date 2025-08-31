using System.Text;
using System.Threading.RateLimiting;
using Civar.Application.Interfaces;
using Civar.Application.Mappers;
using Civar.Application.Validators.Users;
using Civar.Domain.Entities;
using Civar.Domain.Interfaces;
using Civar.Infrastructure;
using Civar.Infrastructure.Identity;
using Civar.Infrastructure.RabbitMQ;
using Civar.Infrastructure.Redis;
using Civar.Infrastructure.Repositories;
using Civar.Infrastructure.ServiceRegistration;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Civar.Infrastructure.Services;
using Civar.Api.Middlewares;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<DatabaseContext>(options =>
{
    options.UseNpgsql(connectionString);
});


var redisConnectionString =
    builder.Configuration["REDIS_CONNECTION"] ??
    builder.Configuration["Redis__Configuration"] ??
    builder.Configuration["Redis__Host"] ??
    "redis:6379,abortConnect=false";


builder.Services.AddSignalR()
    .AddStackExchangeRedis(redisConnectionString);

builder.Services.AddSingleton(new RedisConnectionService(redisConnectionString));
builder.Services.AddSingleton<IMessagePublisher, RedisMessagePublisher>();
builder.Services.AddSingleton<RedisMessageSubscriber>();
builder.Services.AddSingleton<IUserActivityService, UserActivityService>();
builder.Services.AddSingleton<EmailNotificationPublisher>();
builder.Services.AddHostedService<EmailNotificationConsumer>();

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;
})
    .AddEntityFrameworkStores<DatabaseContext>()
    .AddDefaultTokenProviders();

builder.Services.AddScoped<IPasswordHasher<ApplicationUser>, Argon2PasswordHasher>();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var keyString = jwtSettings["Key"] ?? throw new InvalidOperationException("JWT Key is not configured.");
var key = Encoding.UTF8.GetBytes(keyString);

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
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs/message"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
})
.AddGoogle("google", options =>
{
    var googleClientId = builder.Configuration["Authentication:Google:ClientId"];
    var googleClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];

    if (string.IsNullOrEmpty(googleClientId) || string.IsNullOrEmpty(googleClientSecret))
    {
        throw new InvalidOperationException("Google authentication settings are not configured properly.");
    }

    options.ClientId = googleClientId;
    options.ClientSecret = googleClientSecret;
});

builder.Services.AddAuthorization();
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
builder.Services.AddMemoryCache();
builder.Services.AddSingleton<RabbitMqConnectionService>();
builder.Services.AddSingleton<PostPublisher>();
builder.Services.AddSingleton<EventPublisher>();
builder.Services.AddSingleton<PostConsumer>();
builder.Services.AddSingleton<EventConsumer>();

builder.Services.AddValidatorsFromAssemblyContaining<CreateUserDtoValidator>();
builder.Services.AddFluentValidationAutoValidation();

builder.Services.AddApplicationServices();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddInfrastructureServices();
builder.Services.AddScoped<IEmailService, SmtpEmailService>();
builder.Services.AddScoped<TemporaryCodeService>();
builder.Services.AddScoped<ITemporaryCodeService, TemporaryCodeService>();
builder.Services.AddSingleton<IEmailNotificationService, EmailNotificationPublisher>();


builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:5173",
            "http://host.docker.internal:3000" 
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()
        .SetIsOriginAllowedToAllowWildcardSubdomains();
    });
});

builder.Services.AddControllers();
builder.Services.AddValidatorsFromAssemblyContaining<RegisterDtoValidator>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Civar API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. Example: 'Bearer {token}'"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Civar API V1");
    });
}

app.UseCors("FrontendPolicy");

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<UserActivityMiddleware>();
app.UseMiddleware<RedisRateLimitMiddleware>();
app.MapControllers();
app.MapHub<Civar.Api.Hubs.MessageHub>("/hubs/message");

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<DatabaseContext>();
    db.Database.Migrate();
}

using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    string[] roles = new[] { "User", "Admin" };
    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
            await roleManager.CreateAsync(new IdentityRole(role));
    }
}

app.Run();