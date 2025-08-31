using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Civar.Domain.Entities;


namespace Civar.Infrastructure.Persistence.Configurations
{
    public class NeighborhoodConfiguration : IEntityTypeConfiguration<Domain.Entities.Neighborhood>
    {
        public void Configure(EntityTypeBuilder<Domain.Entities.Neighborhood> builder)
        {
            builder.HasKey(n => n.Id);

            builder.Property(n => n.Neighbourhood)
                .IsRequired()
                .HasMaxLength(10);

            builder.Property(n => n.District)
                .HasMaxLength(10);

            builder.HasMany(n => n.Users)
                .WithOne(u => u.Neighborhood)
                .HasForeignKey(u => u.NeighborhoodId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(n => n.Posts)
                .WithOne(p => p.Neighborhood)
                .HasForeignKey(p => p.NeighborhoodId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(n => n.Notifications)
                .WithOne(n => n.Neighborhood)
                .HasForeignKey(n => n.NeighborhoodId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
