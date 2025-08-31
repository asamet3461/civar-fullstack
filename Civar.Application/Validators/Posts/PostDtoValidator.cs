using FluentValidation;
using Civar.Application.DTOs.Posts;
using Civar.Domain.Entities;

namespace Civar.Application.Validators.Posts
{
    public class PostDtoValidator : AbstractValidator<PostDto>
    {
        public PostDtoValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Başlık boş olamaz.")
                .MaximumLength(100).WithMessage("Başlık en fazla 100 karakter olabilir.");

            RuleFor(x => x.Content)
                .NotEmpty().WithMessage("İçerik boş olamaz.")
                .MaximumLength(2000).WithMessage("İçerik en fazla 2000 karakter olabilir.");

            RuleFor(x => x.Location)
                .MaximumLength(200).WithMessage("Lokasyon en fazla 200 karakter olabilir.");

            RuleFor(x => x.Type)
                .IsInEnum().WithMessage("Geçersiz gönderi tipi.");

            RuleFor(x => x.UpdatedAt)
                .LessThanOrEqualTo(DateTime.Now).WithMessage("Güncelleme tarihi gelecekte olamaz.");
        }
    }
}