using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TamTuong.Model.Migrations
{
    /// <inheritdoc />
    public partial class UpdateShopIdtblorderItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ShopId",
                table: "OrderItem",
                type: "uniqueidentifier",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ShopId",
                table: "OrderItem");
        }
    }
}
