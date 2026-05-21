using System;
using System.Collections.Generic;
using System.Text;
using TamTuong.Service.Extensions;

namespace TamTuong.Service.Core
{
    public class ConvertPDFHelper
    {

        public static async Task<byte[]> ConvertDocxToPdf_LibreAsync(byte[] docxBytes, string baseUrl = "http://localhost:9090")
        {
            using var client = new HttpClient();
            client.Timeout = TimeSpan.FromMinutes(5); // Tăng timeout lên 5 phút
            using var request = new MultipartFormDataContent();

            // Gotenberg yêu cầu form-data với file trong field "files"
            var fileContent = new ByteArrayContent(docxBytes);
            fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/vnd.openxmlformats-officedocument.wordprocessingml.document");

            // Tên file phải có đuôi .docx để nó nhận diện
            request.Add(fileContent, "files", "input.docx");

            // Gọi API convert
            var response = await client.PostAsync($"{baseUrl}/forms/libreoffice/convert", request);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new System.Exception($"Gotenberg conversion failed ({response.StatusCode}): {error}");
            }

            return await response.Content.ReadAsByteArrayAsync();
        }

        private static string FindLibreOfficePath()
        {
            string[] possiblePaths = new[]
            {
    // Windows paths
    @"C:\Program Files\LibreOffice\program\soffice.exe",
    @"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
    @"C:\Program Files\LibreOffice\program\soffice.com",
    @"C:\Program Files (x86)\LibreOffice\program\soffice.com",
    
    // Linux paths
    "/usr/bin/libreoffice",
    "/usr/bin/soffice",
    "/snap/bin/libreoffice",
    
    // macOS paths
    "/Applications/LibreOffice.app/Contents/MacOS/soffice",
    "/Applications/LibreOffice.app/Contents/MacOS/soffice.bin"
};

            foreach (string path in possiblePaths)
            {
                if (File.Exists(path))
                    return path;
            }

            // Thử tìm trong PATH environment variable
            string sofficeFromPath = FindInPath("soffice") ?? FindInPath("libreoffice");
            if (!string.IsNullOrEmpty(sofficeFromPath))
                return sofficeFromPath;

            return null;
        }

        private static string FindInPath(string executable)
        {
            string pathEnv = Environment.GetEnvironmentVariable("PATH");
            if (!string.IsNullOrEmpty(pathEnv))
            {
                foreach (string path in pathEnv.Split(Path.PathSeparator))
                {
                    try
                    {
                        string fullPath = Path.Combine(path,
                            OperatingSystem.IsWindows() ? $"{executable}.exe" : executable);
                        if (File.Exists(fullPath))
                            return fullPath;
                    }
                    catch { }
                }
            }

            return null;
        }
    }

    public static class LibreOfficeQueue
    {
        private static readonly int _maxConcurrent =
            AppSettings.LibreOffice.MaxConcurrent == 0
                ? 5
                : AppSettings.LibreOffice.MaxConcurrent;

        private static readonly SemaphoreSlim _semaphore =
            new SemaphoreSlim(_maxConcurrent, _maxConcurrent);

        public static Task WaitAsync() => _semaphore.WaitAsync();

        public static void Release() => _semaphore.Release();
    }
}

