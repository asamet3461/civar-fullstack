using FluentValidation;
using Civar.Application.DTOs.Posts;
using Civar.Application.DTOs.Comments;

public class CreateCommentDtoValidator : AbstractValidator<CreateCommentDto>
{
    public CreateCommentDtoValidator()
    {
        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Yorum içeriği boş bırakılamaz.")
            .MaximumLength(500).WithMessage("Yorum en fazla 500 karakter olabilir.");
    }
}