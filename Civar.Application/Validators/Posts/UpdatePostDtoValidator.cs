using FluentValidation;
using Civar.Application.DTOs.Posts;

namespace Civar.Application.Validators.Posts
{
    public class UpdatePostDtoValidator : AbstractValidator<UpdatePostDto>
    {
        public UpdatePostDtoValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Başlık alanı boş bırakılamaz.")
                .MaximumLength(100).WithMessage("Başlık en fazla 100 karakter olabilir.");

            RuleFor(x => x.Content)
                .NotEmpty().WithMessage("İçerik alanı boş bırakılamaz.")
                .MaximumLength(1000).WithMessage("İçerik en fazla 1000 karakter olabilir.");

            RuleFor(x => x.Location)
                .MaximumLength(200).WithMessage("Konum en fazla 200 karakter olabilir.");
        }
    }
}