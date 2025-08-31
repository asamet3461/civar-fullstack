using Microsoft.Extensions.DependencyInjection;
using System;
using System.Linq;
using System.Reflection;
using Civar.Application.Interfaces; 

namespace Civar.Infrastructure.ServiceRegistration
{
    public static class ServiceRegistrationExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            var assembly = typeof(IUserService).Assembly;

            var serviceTypes = assembly.GetTypes()
                .Where(t => t.IsClass && !t.IsAbstract && t.Name.EndsWith("Service"));

            foreach (var type in serviceTypes)
            {
                var interfaceType = type.GetInterfaces()
                    .FirstOrDefault(i => i.Name == "I" + type.Name);

                if (interfaceType != null)
                {
                    services.AddScoped(interfaceType, type);
                }
            }

            return services;
        }
    }
}
