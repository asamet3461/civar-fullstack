using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Civar.Application.DTOs.Posts;
using Civar.Domain.Interfaces;
using FluentValidation;

namespace Civar.Application.Validators.Posts
{

    public class CreatePostDtoValidator : AbstractValidator<CreatePostDto>
    {
        private readonly IPostRepository _postRepository;
        public CreatePostDtoValidator(IPostRepository postRepository)
        {
            _postRepository = postRepository;

            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Başlık alanı zorunludur.")
                .MaximumLength(50).WithMessage("Başlık alanı en fazla 100 karakterden oluşabilir");
            RuleFor(x => x.Content)
                .NotEmpty().WithMessage("İçerik alanı zorunludur.")
                .MaximumLength(500).WithMessage("İçerik alanı en fazla 500 karakterden oluşabilir");
            RuleFor(x => x.Location)
                .MaximumLength(200).WithMessage("Konum en fazla 200 karakter olabilir.");
            RuleFor(x => x.Type)
                .IsInEnum().WithMessage("Geçerli bir gönderi tipi seçilmelidir.");
        }
    }
}
