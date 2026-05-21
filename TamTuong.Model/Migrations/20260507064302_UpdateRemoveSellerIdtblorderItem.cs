using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TamTuong.Model.Migrations
{
    /// <inheritdoc />
    public partial class UpdateRemoveSellerIdtblorderItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SellersId",
                table: "OrderItem");

            migrationBuilder.RenameColumn(
                name: "SellerId",
                table: "Promotion",
                newName: "ShopId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ShopId",
                table: "Promotion",
                newName: "SellerId");

            migrationBuilder.AddColumn<Guid>(
                name: "SellersId",
                table: "OrderItem",
                type: "uniqueidentifier",
                nullable: true);
        }
    }
}
