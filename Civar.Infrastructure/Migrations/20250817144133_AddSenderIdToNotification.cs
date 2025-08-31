using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Civar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSenderIdToNotification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ReceiverId",
                table: "Notifications",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SenderId",
                table: "Notifications",
                type: "uuid",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReceiverId",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "SenderId",
                table: "Notifications");
        }
    }
}
