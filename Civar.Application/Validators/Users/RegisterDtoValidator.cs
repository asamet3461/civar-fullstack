using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Civar.Application.DTOs.Auth;
using FluentValidation;

namespace Civar.Application.Validators.Users
{
    

   
    public class RegisterDtoValidator : AbstractValidator<RegisterDto>
    {
        public RegisterDtoValidator()
        {
            RuleFor(x => x.VerificationCode)
                .NotEmpty()
                .When(x => !x.IsGoogleUser)
                .WithMessage("Doğrulama kodu zorunludur.");
        }
    }
}
