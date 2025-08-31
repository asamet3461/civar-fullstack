using AutoMapper;
using Civar.Application.DTOs.Events;
using Civar.Domain.Entities;

public class EventMappingProfile : Profile
{
    public EventMappingProfile()
    {
        CreateMap<EventRSVP, EventRSVPDto>();

        CreateMap<Event, EventDto>()
            .ForMember(dest => dest.NeighborhoodName, opt => opt.MapFrom(src => src.Neighborhood != null ? src.Neighborhood.Neighbourhood : null))
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? $"{src.User.Name} {src.User.Surname}" : null))
            .ForMember(dest => dest.RSVPCount, opt => opt.MapFrom(src => src.RSVPs != null ? src.RSVPs.Count : 0))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
            .ForMember(dest => dest.Participants, opt => opt.Ignore())
            .ForMember(dest => dest.RSVPs, opt => opt.MapFrom(src => src.RSVPs)); 

        CreateMap<CreateEventDto, Event>()
            .ForCtorParam("neighborhoodId", opt => opt.MapFrom(src => src.NeighborhoodId))
            .ForCtorParam("title", opt => opt.MapFrom(src => src.Title))
            .ForCtorParam("description", opt => opt.MapFrom(src => src.Description))
            .ForCtorParam("startTime", opt => opt.MapFrom(src => src.StartTime))
            .ForCtorParam("endTime", opt => opt.MapFrom(src => src.EndTime))
            .ForCtorParam("location", opt => opt.MapFrom(src => src.Location));

        CreateMap<UpdateEventDto, Event>()
            .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
    }
}