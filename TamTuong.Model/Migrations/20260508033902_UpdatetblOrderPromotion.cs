using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TamTuong.Model.Migrations
{
    /// <inheritdoc />
    public partial class UpdatetblOrderPromotion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "SellerId",
                table: "OrderPromotion",
                newName: "ShopId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ShopId",
                table: "OrderPromotion",
                newName: "SellerId");
        }
    }
}
