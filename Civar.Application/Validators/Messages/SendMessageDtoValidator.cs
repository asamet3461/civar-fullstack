
using FluentValidation;
using Civar.Application.DTOs.Messages;

public class SendMessageDtoValidator : AbstractValidator<SendMessageDto>
{
    public SendMessageDtoValidator()
    {
        RuleFor(x => x.SenderId);
        RuleFor(x => x.ReceiverId);
        RuleFor(x => x.Content)
            .NotEmpty()
            .MaximumLength(500);
    }
}