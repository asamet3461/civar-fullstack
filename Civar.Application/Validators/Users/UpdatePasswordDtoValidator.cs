using FluentValidation;
using Civar.Application.DTOs.Users;

namespace Civar.Application.Validators.Users
{
    public class UpdatePasswordDtoValidator : AbstractValidator<UpdatePasswordDto>
    {
        public UpdatePasswordDtoValidator()
        {
            RuleFor(x => x.NewPassword)
                .NotEmpty().WithMessage("Yeni şifre alanı zorunludur.")
                .MinimumLength(8).WithMessage("Yeni şifre en az 8 karakter uzunluğunda olmalıdır.")
                .Matches("[A-Z]").WithMessage("Yeni şifre en az bir büyük harf içermelidir.")
                .Matches("[a-z]").WithMessage("Yeni şifre en az bir küçük harf içermelidir.")
                .Matches("[0-9]").WithMessage("Yeni şifre en az bir rakam içermelidir.");

            RuleFor(x => x.NewPassword)
                .NotEqual(x => x.CurrentPassword)
                .WithMessage("Yeni şifre, mevcut şifrenizle aynı olamaz.");
        }
    }
}