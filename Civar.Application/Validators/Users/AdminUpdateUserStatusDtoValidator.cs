using FluentValidation;
using Civar.Application.DTOs.Users;

namespace Civar.Application.Validators.Users
{
    public class AdminUpdateUserStatusDtoValidator : AbstractValidator<AdminUpdateUserStatusDto>
    {
        public AdminUpdateUserStatusDtoValidator()
        {
            
        }
    }
}