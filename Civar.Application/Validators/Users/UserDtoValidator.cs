using FluentValidation;
using Civar.Application.DTOs.Users;

namespace Civar.Application.Validators.Users
{
    public class UserDtoValidator : AbstractValidator<UserDto>
    {
        public UserDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("İsim boş olamaz.")
                .MaximumLength(50).WithMessage("İsim en fazla 50 karakter olabilir.");

            RuleFor(x => x.Surname)
                .NotEmpty().WithMessage("Soyisim boş olamaz.")
                .MaximumLength(50).WithMessage("Soyisim en fazla 50 karakter olabilir.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email boş olamaz.")
                .EmailAddress().WithMessage("Geçerli bir email adresi giriniz.");

            RuleFor(x => x.PhoneNumber)
                .MaximumLength(20).WithMessage("Telefon numarası en fazla 20 karakter olabilir.");

            RuleFor(x => x.Address)
                .MaximumLength(200).WithMessage("Adres en fazla 200 karakter olabilir.");

            RuleFor(x => x.Bio)
                .MaximumLength(500).WithMessage("Biyografi en fazla 500 karakter olabilir.");

            RuleFor(x => x.ProfilePictureUrl)
                .MaximumLength(300).WithMessage("Profil fotoğrafı URL'si en fazla 300 karakter olabilir.");
        }
    }
}