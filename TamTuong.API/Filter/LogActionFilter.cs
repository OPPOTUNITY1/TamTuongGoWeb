using Microsoft.AspNetCore.Mvc.Filters;
using System.Text.Json;
using TamTuong.Model;

namespace TamTuong.API.Filter
{
    public class LogActionFilter : IActionFilter
    {
        private readonly ILogger<LogActionFilter> _logger;
        private readonly TamTuongContext _dbContext;

        public LogActionFilter(ILogger<LogActionFilter> logger, TamTuongContext dbContext)
        {
            _logger = logger;
            _dbContext = dbContext;
        }

        public void OnActionExecuting(ActionExecutingContext context)
        {
            /*var request = context.HttpContext.Request;
            var logAttr = context.ActionDescriptor.EndpointMetadata
                  .OfType<LogActionNameAttribute>()
                  .FirstOrDefault();
            audit = new Audit
            {
                AuditID = Guid.NewGuid(),
                TimeAccessed = DateTime.UtcNow,
                IPAddress = context.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "",
                UserName = context.HttpContext.User?.Identity?.HoTen ?? "Ẩn danh",
                URLAccessed = request.Path.Value ?? "",
                Data = SerializeRequest(request),
                SessionID = "",
                UserId = Guid.TryParse(context.HttpContext.User?.Claims?.FirstOrDefault()?.Value, out var id) ? id : Guid.Empty,
                Note = logAttr?.HoTen ?? context.ActionDescriptor.DisplayName
            };*/
        }

        public void OnActionExecuted(ActionExecutedContext context)
        {

        }

        private string SerializeRequest(HttpRequest request)
        {
            var requestInfo = new
            {
                Method = request.Method,
                Url = $"{request.Scheme}://{request.Host}{request.Path}{request.QueryString}",
                Headers = request.Headers.ToDictionary(h => h.Key, h => h.Value.ToString()),
                QueryString = request.QueryString.Value,
                Body = ReadRequestBody(request)
            };

            return JsonSerializer.Serialize(requestInfo, new JsonSerializerOptions { WriteIndented = true });
        }

        private string ReadRequestBody(HttpRequest request)
        {
            if (!request.Body.CanSeek) return null;

            request.Body.Seek(0, SeekOrigin.Begin);
            using var reader = new StreamReader(request.Body, leaveOpen: true);
            var body = reader.ReadToEnd();
            request.Body.Seek(0, SeekOrigin.Begin);
            return body;
        }
    }
}
