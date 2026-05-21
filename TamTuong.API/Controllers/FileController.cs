using Microsoft.AspNetCore.Mvc;
using TamTuong.API.Dto;
using TamTuong.Service.Dto;
using Microsoft.AspNetCore.Http;
using System.IO;
using Microsoft.AspNetCore.Hosting;

namespace TamTuong.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FileController : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;

        public FileController(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        [Consumes("multipart/form-data")]
        [HttpPost("Upload")]
        public async Task<DataResponse<List<FileDataResponse>>> Upload([FromForm] List<IFormFile> files)
        {
            try
            {
                if (files == null || files.Count == 0)
                {
                    return DataResponse<List<FileDataResponse>>.False("Không có file được gửi");
                }

                var webRootPath = _environment.WebRootPath;
                if (string.IsNullOrWhiteSpace(webRootPath))
                {
                    webRootPath = Path.Combine(_environment.ContentRootPath, "wwwroot");
                }

                var uploadsRoot = Path.Combine(webRootPath, "uploads", "products");
                if (!Directory.Exists(uploadsRoot)) Directory.CreateDirectory(uploadsRoot);

                var results = new List<FileDataResponse>();

                foreach (var file in files)
                {
                    var ext = Path.GetExtension(file.FileName);
                    var fileName = $"{Guid.NewGuid()}{ext}";
                    var filePath = Path.Combine(uploadsRoot, fileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }
                    var url = $"{Request.Scheme}://{Request.Host}/uploads/products/{fileName}";
                    results.Add(new FileDataResponse { Id = fileName, Name = file.FileName, Url = url });
                }

                return DataResponse<List<FileDataResponse>>.Success(results, "Upload thành công");
            }
            catch (Exception ex)
            {
                return DataResponse<List<FileDataResponse>>.False("Lỗi khi upload file: " + ex.Message);
            }
        }
    }
}
