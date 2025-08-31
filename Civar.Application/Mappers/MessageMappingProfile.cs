using AutoMapper;
using Civar.Domain.Entities;
using Civar.Application.DTOs.Messages;

namespace Civar.Application.Mappers
{
    public class MessageMappingProfile : Profile
    {
        public MessageMappingProfile()
        {
            CreateMap<Message, MessageDto>()
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
                .ForMember(dest => dest.SenderName, opt => opt.MapFrom(src => src.Sender != null ? $"{src.Sender.FirstName} {src.Sender.LastName}" : string.Empty))
                .ForMember(dest => dest.ReceiverName, opt => opt.MapFrom(src => src.Receiver != null ? $"{src.Receiver.FirstName} {src.Receiver.LastName}" : null))
                .ForMember(dest => dest.NeighborhoodName, opt => opt.MapFrom(src => src.Neighborhood != null ? src.Neighborhood.Name : null))
                .ForMember(dest => dest.SenderAvatar, opt => opt.MapFrom(src => src.Sender != null ? src.Sender.ProfilePicture : string.Empty));

            CreateMap<SendPrivateMessageDto, Message>()
                .ForMember(dest => dest.Content, opt => opt.MapFrom(src => src.Content))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => MessageType.Private));

            CreateMap<SendNeighborhoodMessageDto, Message>()
                .ForMember(dest => dest.Content, opt => opt.MapFrom(src => src.Content))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => MessageType.Neighborhood));
        }
    }
}