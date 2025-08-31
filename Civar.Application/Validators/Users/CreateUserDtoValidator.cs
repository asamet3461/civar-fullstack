using FluentValidation;
using Civar.Application.DTOs.Users;
using Civar.Domain.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace Civar.Application.Validators.Users
{
    public class CreateUserDtoValidator : AbstractValidator<CreateUserDto>
    {
        private readonly IUserRepository _userRepository;

        public CreateUserDtoValidator(IUserRepository userRepository)
        {
            _userRepository = userRepository;

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Ad alanı zorunludur.")
                .MaximumLength(50).WithMessage("Ad alanı en fazla 50 karakterden oluşabilir.");

            RuleFor(x => x.Surname)
                .NotEmpty().WithMessage("Soyad alanı zorunludur.")
                .MaximumLength(50).WithMessage("Soyad alanı en fazla 50 karakterden oluşabilir.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("E-posta adresi zorunludur.")
                .EmailAddress().WithMessage("Geçerli bir e-posta adresi giriniz.")
                .MustAsync(IsEmailUnique).WithMessage("Bu e-posta adresi zaten kullanılıyor.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Şifre alanı zorunludur.")
                .MinimumLength(8).WithMessage("Şifre en az 8 karakter uzunluğunda olmalıdır.")
                .Matches("[A-Z]").WithMessage("Şifre en az bir büyük harf içermelidir.")
                .Matches("[a-z]").WithMessage("Şifre en az bir küçük harf içermelidir.")
                .Matches("[0-9]").WithMessage("Şifre en az bir rakam içermelidir.");
        }


        private async Task<bool> IsEmailUnique(string email, CancellationToken cancellationToken)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            return user == null;
        }
    }
}