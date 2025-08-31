using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Civar.Domain.Entities;

namespace Civar.Infrastructure.Persistence.Configurations
{
    public class PostConfiguration : IEntityTypeConfiguration<Post>
    {
        public void Configure(EntityTypeBuilder<Post> builder)
        {
            builder.HasKey(p => p.Id); 

            builder.Property(p => p.Title)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(p => p.Content)
                .IsRequired()
                .HasMaxLength(1000);    

            builder.Property(p => p.Location)
                .HasMaxLength(200);

            builder.HasOne(p => p.User)
                     .WithMany(u => u.Posts)
                     .HasForeignKey(p => p.UserId)
                     .OnDelete(DeleteBehavior.Restrict); 
            builder.HasOne(p => p.Neighborhood)
                     .WithMany(n => n.Posts)
                     .HasForeignKey(p => p.NeighborhoodId)
                     .OnDelete(DeleteBehavior.Restrict);
            builder.HasMany(p => p.Comments)
                     .WithOne(c => c.Post)
                     .HasForeignKey(c => c.PostId)
                     .OnDelete(DeleteBehavior.Cascade);


        }
    }
}
