using AutoMapper;
using Civar.Domain.Entities;
using Civar.Application.DTOs.Neighborhoods;

namespace Civar.Application.Mappers
{
    public class NeighborhoodMappingProfile : Profile
    {
        public NeighborhoodMappingProfile()
        {
            
            CreateMap<Neighborhood, NeighborhoodDto>().ReverseMap();

          
            CreateMap<CreateNeighborhoodDto, Neighborhood>();

         
            CreateMap<UpdateNeighborhoodDto, Neighborhood>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}