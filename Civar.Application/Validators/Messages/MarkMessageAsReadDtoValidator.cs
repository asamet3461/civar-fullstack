using FluentValidation;
using Civar.Application.DTOs.Messages;

public class MarkMessageAsReadDtoValidator : AbstractValidator<MarkMessageAsReadDto>
{
    public MarkMessageAsReadDtoValidator()
    {
        RuleFor(x => x.MessageId).NotEmpty().WithMessage("MessageId gereklidir");
    }
}