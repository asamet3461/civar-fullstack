using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Civar.Application.DTOs.Posts;
using Civar.Domain.Entities;

namespace Civar.Application.Mappers
{
    public class PostMappingProfile : Profile
    {
        public PostMappingProfile()
        {
            CreateMap<Post, PostDto>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? src.User.Name + " " + src.User.Surname : null))
                .ForMember(dest => dest.Neighborhood, opt => opt.MapFrom(src => src.Neighborhood != null ? src.Neighborhood.Neighbourhood : null));
            CreateMap<CreatePostDto, Post>();
            CreateMap<UpdatePostDto, Post>();
        }
    }
}
