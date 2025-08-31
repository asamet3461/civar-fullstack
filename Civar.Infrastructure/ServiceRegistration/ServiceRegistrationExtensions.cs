// using Civar.Application.Interfaces; // IPasswordHasher için eklendi (ARTIK GEREKLİ DEĞİL)
using Civar.Domain.Interfaces;
using Civar.Infrastructure.Identity; // Argon2PasswordHasher için eklendi
using Civar.Infrastructure.Persistence.Repositories;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Identity; // Bunu ekleyin!
using Civar.Domain.Entities;         // ApplicationUser için ekleyin
using System.Reflection;

namespace Civar.Infrastructure.ServiceRegistration
{
    public static class ServiceRegistrationExtensions
    {
        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services)
        {
            services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));

            var assembly = typeof(GenericRepository<>).Assembly;
            var repositoryTypes = assembly.GetTypes()
                .Where(t => t.IsClass && !t.IsAbstract && t.Name.EndsWith("Repository"));

            foreach (var type in repositoryTypes)
            {
                var interfaceType = type.GetInterfaces()
                    .FirstOrDefault(i => i.Name == "I" + type.Name);

                if (interfaceType != null)
                {
                    services.AddScoped(interfaceType, type);
                }
            }

            // DOĞRU KAYIT: Microsoft Identity ile uyumlu şekilde
            services.AddScoped<IPasswordHasher<ApplicationUser>, Argon2PasswordHasher>();
            services.AddScoped<IAuditLogRepository, AuditLogRepository>();

            return services;
        }
    }
}