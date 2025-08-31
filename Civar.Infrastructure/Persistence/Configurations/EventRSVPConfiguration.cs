using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Civar.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Civar.Infrastructure.Persistence.Configurations
{
    public class EventRSVPConfiguration : IEntityTypeConfiguration<EventRSVP>
    {
        public void Configure(EntityTypeBuilder<EventRSVP> builder)
        {
            builder.HasKey(n => n.Id);

            builder.HasOne(n => n.User)
                   .WithMany(u => u.EventRSVPs)
                   .HasForeignKey(n => n.UserId)
                   .OnDelete(DeleteBehavior.Restrict); 

            builder.HasOne(n => n.Event)
                   .WithMany(e => e.RSVPs)
                   .HasForeignKey(n => n.EventId)
                   .OnDelete(DeleteBehavior.Restrict); 

            builder.HasMany(n => n.Notifications)
                   .WithOne(n => n.EventRSVP)
                   .HasForeignKey(n => n.EventRSVPId)
                   .OnDelete(DeleteBehavior.Cascade); 
        }
    }
}
