using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TamTuong.Model.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCart : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Index IX_ProductImage_ProductId was never created, nothing to drop.
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
