using FluentValidation;
using Civar.Application.DTOs.Neighborhoods;

namespace Civar.Application.Validators.Neighborhoods
{
    public class CreateNeighborhoodDtoValidator : AbstractValidator<CreateNeighborhoodDto>
    {
        public CreateNeighborhoodDtoValidator()
        {
            RuleFor(x => x.Neighbourhood)
                .NotEmpty().WithMessage("Mahalle adı boş olamaz.")
                .MaximumLength(500).WithMessage("Mahalle adı en fazla 20 karakter olabilir.");

            RuleFor(x => x.District)
                .NotEmpty().WithMessage("İlçe adı boş olamaz.")
                .MaximumLength(500).WithMessage("İlçe adı en fazla 20 karakter olabilir.");

            RuleFor(x => x.City)
                .NotEmpty().WithMessage("Şehir adı boş olamaz.")
                .MaximumLength(500).WithMessage("Şehir adı en fazla 20 karakter olabilir.");
        }
    }
}