using AutoMapper;
using Civar.Domain.Entities;
using Civar.Application.DTOs.Comments;

public class CommentMappingProfile : Profile
{
    public CommentMappingProfile()
    {
        CreateMap<Comment, CommentDto>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? src.User.Name : null))
            .ForMember(dest => dest.UserSurname, opt => opt.MapFrom(src => src.User != null ? src.User.Surname : null));
    }
}