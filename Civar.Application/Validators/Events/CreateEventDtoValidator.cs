using FluentValidation;
using Civar.Application.DTOs.Events;

public class CreateEventDtoValidator : AbstractValidator<CreateEventDto>
{
    public CreateEventDtoValidator()
    {
        RuleFor(x => x.NeighborhoodId);
        RuleFor(x => x.Title).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(1000);
        RuleFor(x => x.StartTime).GreaterThan(DateTime.MinValue);
        RuleFor(x => x.EndTime)
            .GreaterThan(x => x.StartTime)
            .WithMessage("Bitiş tarihi başlangıç tarihinden sonra olmalı.");
        RuleFor(x => x.Location).NotEmpty().MaximumLength(200);
    }
}