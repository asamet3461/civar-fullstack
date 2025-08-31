using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Civar.Domain.Entities;

namespace Civar.Infrastructure.Persistence.Configurations
{
    public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
    {
        public void Configure(EntityTypeBuilder<Notification> builder)
        {
            builder.HasKey(n => n.Id);

            builder.HasOne(n => n.User)
                   .WithMany(u => u.Notifications)
                   .HasForeignKey(n => n.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(n => n.Post)            
           .WithMany(p => p.Notifications)  
           .HasForeignKey(n => n.PostId)
           .OnDelete(DeleteBehavior.Cascade);

           builder.HasOne(n => n.Event)
                    .WithMany(e => e.Notifications)
                    .HasForeignKey(n => n.EventId)
                    .OnDelete(DeleteBehavior.Cascade);
    
           builder.HasOne(n => n.Comment)
                    .WithMany(c => c.Notifications)
                    .HasForeignKey(n => n.CommentId)
                    .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(n => n.Message)
                    .WithMany(m => m.Notifications)
                    .HasForeignKey(n => n.MessageId)
                    .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(n => n.EventRSVP)
                    .WithMany(er => er.Notifications)
                    .HasForeignKey(n => n.EventRSVPId)
                    .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(n => n.Neighborhood)
                    .WithMany(n => n.Notifications)
                    .HasForeignKey(n => n.NeighborhoodId)
                    .OnDelete(DeleteBehavior.Cascade);

            builder.Property(n => n.NotificationText)
                    .IsRequired()
                    .HasMaxLength(50);
        }
    }
}
