using Civar.Application.DTOs.Messages;
using FluentValidation;

namespace Civar.Application.Validators.Messages
{
    public class SendNeighborhoodMessageDtoValidator : AbstractValidator<SendNeighborhoodMessageDto>
    {
        public SendNeighborhoodMessageDtoValidator()
        {
            RuleFor(x => x.NeighborhoodId)
                .NotEmpty()
                .WithMessage("Geçerli bir mahalle seçiniz");

            RuleFor(x => x.Content)
                .NotEmpty()
                .WithMessage("Mesaj içeriği boş olamaz")
                .Length(1, 5000)
                .WithMessage("Mesaj 1-5000 karakter arasında olmalıdır")
                .Must(content => !string.IsNullOrWhiteSpace(content))
                .WithMessage("Mesaj sadece boşluk karakterlerinden oluşamaz");
        }
    }
}