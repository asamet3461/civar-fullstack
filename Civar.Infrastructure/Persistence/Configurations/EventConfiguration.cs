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
    public class EventConfiguration : IEntityTypeConfiguration<Event>
    {
        public void Configure(EntityTypeBuilder<Event> builder)
        {
            builder.HasKey(e => e.Id);

            builder.HasOne(e => e.Neighborhood)
                   .WithMany(n => n.Events)
                   .HasForeignKey(e => e.NeighborhoodId)
                   .OnDelete(DeleteBehavior.Restrict); 

            builder.HasOne(e => e.User)
                   .WithMany(u => u.Events)
                   .HasForeignKey(e => e.UserId)
                   .OnDelete(DeleteBehavior.Restrict); 

            builder.Property(e => e.Title)
                   .IsRequired()
                   .HasMaxLength(50); 

            builder.Property(e => e.Description)
                     .IsRequired()
                     .HasMaxLength(300); 

            builder.Property(e => e.Location)
                   .IsRequired()
                   .HasMaxLength(100); 

            builder.HasMany(e => e.RSVPs)
                   .WithOne(r => r.Event)
                   .HasForeignKey(r => r.EventId)
                   .OnDelete(DeleteBehavior.Cascade); 

            builder.HasMany(e => e.Notifications)
                     .WithOne(n => n.Event)
                     .HasForeignKey(n => n.EventId)
                     .OnDelete(DeleteBehavior.Cascade); 

        }
    }
}
