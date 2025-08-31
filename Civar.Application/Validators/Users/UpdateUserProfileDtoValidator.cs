using FluentValidation;
using Civar.Application.DTOs.Users;

namespace Civar.Application.Validators.Users
{
    public class UpdateUserProfileDtoValidator : AbstractValidator<UpdateUserProfileDto>
    {
        public UpdateUserProfileDtoValidator()
        {
            RuleFor(x => x.Name)
                .MaximumLength(50).WithMessage("Ad alanı en fazla 50 karakterden oluşabilir.");

            RuleFor(x => x.Surname)
                .MaximumLength(50).WithMessage("Soyad alanı en fazla 50 karakterden oluşabilir.");

            RuleFor(x => x.Bio)
                .MaximumLength(500).WithMessage("Biyografi alanı en fazla 500 karakterden oluşabilir.");

            RuleFor(x => x.PhoneNumber)
                .MaximumLength(15).WithMessage("Telefon numarası en fazla 15 karakterden oluşabilir.");
        }
    }
}