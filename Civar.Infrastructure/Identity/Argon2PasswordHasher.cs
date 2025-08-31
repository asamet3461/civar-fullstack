using System.Security.Cryptography;
using System.Text;
using Konscious.Security.Cryptography;
using Microsoft.AspNetCore.Identity;
using Civar.Domain.Entities;

namespace Civar.Infrastructure.Identity
{
    public class Argon2PasswordHasher : IPasswordHasher<ApplicationUser>
    {
        private const int SaltSize = 16; 
        private const int DegreeOfParallelism = 4;
        private const int Iterations = 2;
        private const int MemorySize = 1024 * 1024; 

        public string HashPassword(ApplicationUser user, string password)
        {
            var salt = new byte[SaltSize];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt);
            }

            var argon2 = new Argon2d(Encoding.UTF8.GetBytes(password))
            {
                Salt = salt,
                DegreeOfParallelism = DegreeOfParallelism,
                Iterations = Iterations,
                MemorySize = MemorySize
            };

            var hash = argon2.GetBytes(32); 
            return $"{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
        }

        public PasswordVerificationResult VerifyHashedPassword(ApplicationUser user, string hashedPassword, string providedPassword)
        {
            var parts = hashedPassword.Split('.');
            if (parts.Length != 2)
                return PasswordVerificationResult.Failed;

            var salt = Convert.FromBase64String(parts[0]);
            var hash = Convert.FromBase64String(parts[1]);

            var argon2 = new Argon2d(Encoding.UTF8.GetBytes(providedPassword))
            {
                Salt = salt,
                DegreeOfParallelism = DegreeOfParallelism,
                Iterations = Iterations,
                MemorySize = MemorySize
            };

            var newHash = argon2.GetBytes(32);

            if (CryptographicOperations.FixedTimeEquals(newHash, hash))
                return PasswordVerificationResult.Success;
            else
                return PasswordVerificationResult.Failed;
        }
    }
}