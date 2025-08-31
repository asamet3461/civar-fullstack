using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Civar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFullNameToApplicationUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // UserId sütununu tamamen kaldırıp uuid olarak tekrar ekle (veri kaybı olur)
            migrationBuilder.DropColumn(
                name: "UserId",
                table: "AspNetUsers");

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "AspNetUsers",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FullName",
                table: "AspNetUsers",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FullName",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "AspNetUsers");

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "AspNetUsers",
                type: "integer",
                nullable: true);
        }
    }
}