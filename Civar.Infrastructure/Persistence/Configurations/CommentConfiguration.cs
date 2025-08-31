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
    public class CommentConfiguration : IEntityTypeConfiguration<Comment>
    {
        public void Configure(EntityTypeBuilder<Comment> builder)
        {
            builder.HasKey(c => c.Id);

            builder.HasOne(c => c.User)
                   .WithMany(u => u.Comments)
                   .HasForeignKey(c => c.UserId)
                   .OnDelete(DeleteBehavior.Cascade); 

            builder.HasOne(c => c.Post)
                   .WithMany(p => p.Comments)
                   .HasForeignKey(c => c.PostId)
                   .OnDelete(DeleteBehavior.Cascade); 

            builder.Property(c => c.Content)
                   .IsRequired()
                   .HasMaxLength(500);

            builder.HasMany(c => c.Notifications)
                   .WithOne(n => n.Comment)
                   .HasForeignKey(n => n.CommentId)
                   .OnDelete(DeleteBehavior.Cascade); 
        }
    }
}
