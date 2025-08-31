using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Civar.Domain.Entities;

namespace Civar.Infrastructure.Persistence.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.HasKey(u => u.Id);

            builder.Property(u => u.Name)
                    .IsRequired()
                    .HasMaxLength(30);

            builder.Property(u => u.Surname)
                    .IsRequired()
                    .HasMaxLength(30);

            builder.Property(u => u.PhoneNumber)
                    .HasMaxLength(10);

            builder.Property(u => u.Address)
                    .HasMaxLength(200);

            builder.Property(u => u.Bio)
                    .HasMaxLength(500);

            builder.Property(u => u.ProfilePicture)
                    .HasMaxLength(200);

            // NeighborhoodId property mapping
            builder.Property(u => u.NeighborhoodId)
                    .IsRequired(false); // Nullable olduğu için

            // Mahalle ile ilişki
            builder.HasOne(u => u.Neighborhood)
                    .WithMany(n => n.Users)
                    .HasForeignKey(u => u.NeighborhoodId)
                    .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(u => u.Posts)
                    .WithOne(p => p.User)
                    .HasForeignKey(p => p.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(u => u.Comments)
                    .WithOne(c => c.User)
                    .HasForeignKey(c => c.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(u => u.SentMessages)
                    .WithOne(m => m.Sender)
                    .HasForeignKey(m => m.SenderId)
                    .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(u => u.ReceivedMessages)
                    .WithOne(m => m.Receiver)
                    .HasForeignKey(m => m.ReceiverId)
                    .OnDelete(DeleteBehavior.SetNull);

            builder.HasMany(u => u.Notifications)
                    .WithOne(n => n.User)
                    .HasForeignKey(n => n.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(u => u.EventRSVPs)
                    .WithOne(e => e.User)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
        }
    }
}