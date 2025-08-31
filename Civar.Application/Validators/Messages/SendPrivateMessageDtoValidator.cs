using Civar.Application.DTOs.Messages;
using FluentValidation;

namespace Civar.Application.Validators.Messages
{
    public class SendPrivateMessageDtoValidator : AbstractValidator<SendPrivateMessageDto>
    {
        public SendPrivateMessageDtoValidator()
        {
            RuleFor(x => x.ReceiverId)
                 .NotEmpty()
                 .WithMessage("Geçerli bir alıcı seçiniz");

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