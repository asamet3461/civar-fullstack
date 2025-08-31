using FluentValidation;
using Civar.Application.DTOs.Messages;

public class MessageDtoValidator : AbstractValidator<MessageDto>
{
    public MessageDtoValidator()
    {
        RuleFor(x => x.Id);
        RuleFor(x => x.SenderId);
        RuleFor(x => x.ReceiverId);
        RuleFor(x => x.Content)
            .NotEmpty()
            .MaximumLength(500);
        RuleFor(x => x.CreatedAt).NotEmpty();
    }
}
