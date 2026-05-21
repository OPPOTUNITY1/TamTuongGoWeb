using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TamTuong.Model.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCitytblUserInformation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "UserInformation",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "City",
                table: "UserInformation");
        }
    }
}
