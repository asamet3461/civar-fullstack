using StackExchange.Redis;

namespace Civar.Infrastructure.Redis { 
public class RedisConnectionService
{
    private readonly Lazy<ConnectionMultiplexer> _connection;
    public RedisConnectionService(string configuration)
    {
        _connection = new Lazy<ConnectionMultiplexer>(() => ConnectionMultiplexer.Connect(configuration));
    }
    public ConnectionMultiplexer Connection => _connection.Value;
    public IDatabase Database => Connection.GetDatabase();
    public ISubscriber Subscriber => Connection.GetSubscriber();
}
}