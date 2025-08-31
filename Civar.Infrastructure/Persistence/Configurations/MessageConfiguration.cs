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
    public class MessageConfiguration : IEntityTypeConfiguration<Message>
    {
        public void Configure(EntityTypeBuilder<Message> builder)
        {
            builder.HasKey(m => m.Id);

            builder.HasOne(m => m.Sender)
                   .WithMany(u => u.SentMessages)
                   .HasForeignKey(m => m.SenderId)
                   .OnDelete(DeleteBehavior.Restrict); 

            builder.HasOne(m => m.Receiver)
                   .WithMany(u => u.ReceivedMessages)
                   .HasForeignKey(m => m.ReceiverId)
                   .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasMany(n => n.Notifications)
                   .WithOne(n => n.Message)
                   .HasForeignKey(n => n.MessageId)
                   .OnDelete(DeleteBehavior.Cascade); 

            builder.Property(m => m.Content)
                   .IsRequired()
                   .HasMaxLength(500); 
        }
    }
}
