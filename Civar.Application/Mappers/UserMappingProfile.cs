using AutoMapper;
using Civar.Application.DTOs.Users;
using Civar.Domain.Entities;

namespace Civar.Application.Mappers
{
    public class UserMappingProfile : Profile
    {
        public UserMappingProfile()
        {
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.NeighborhoodName, opt => opt.MapFrom(src => src.Neighborhood.Name))
                .ForMember(dest => dest.ProfilePictureUrl, opt => opt.MapFrom(src => src.ProfilePicture));

            CreateMap<CreateUserDto, User>();
            CreateMap<UpdateUserProfileDto, User>();
            CreateMap<AdminUpdateUserStatusDto, User>();
            CreateMap<UpdatePasswordDto, User>();
            CreateMap<UpdateProfilePictureDto, User>();
        }
    }
}