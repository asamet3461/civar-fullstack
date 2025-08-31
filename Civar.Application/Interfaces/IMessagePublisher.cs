namespace Civar.Application.Interfaces
{
    public interface IMessagePublisher
    {
        Task PublishAsync(string channel, string message);
    }
}