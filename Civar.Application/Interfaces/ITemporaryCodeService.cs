using System;
using System.Threading.Tasks;

namespace Civar.Application.Interfaces
{
    public interface ITemporaryCodeService
    {
        Task SetCodeAsync(string key, string code, TimeSpan expiresIn);
        Task<bool> ValidateCodeAsync(string key, string code);
        Task DeleteCodeAsync(string key);
    }
}