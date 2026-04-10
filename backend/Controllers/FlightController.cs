//backend/Controllers/FlightController.cs : 
using FlightSearch.API.Application.DTOs;
using FlightSearch.API.Application.UseCases;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; 
using FlightSearch.API.Infrastructure.Providers;
using Microsoft.Extensions.Configuration; // این هم برای خواندن کانفیگ لازم است

namespace FlightSearch.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FlightController : ControllerBase
{
    private readonly SearchFlightsUseCase _searchFlightsUseCase;
    private readonly ILogger<FlightController> _logger;

    public FlightController(
        SearchFlightsUseCase searchFlightsUseCase,
        ILogger<FlightController> logger)
    {
        _searchFlightsUseCase = searchFlightsUseCase;
        _logger = logger;
    }

    [HttpPost("search")]
    public async Task<ActionResult<FlightSearchResponseDto>> SearchFlights(
        [FromBody] FlightSearchRequestDto? request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (request == null)
            {
                return BadRequest(new FlightSearchResponseDto
                {
                    Success = false,
                    ErrorMessage = "Invalid request body. Expected JSON with Origin, Destination, DepartureDate."
                });
            }

            // Normalize DepartureDate - handle date-only string or default
            if (request.DepartureDate == default || request.DepartureDate.Date.Year < 2000)
            {
                request.DepartureDate = DateTime.Today.AddDays(1);
            }

            // Use Case handles all validation and business logic
            var result = await _searchFlightsUseCase.ExecuteAsync(request, cancellationToken);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in SearchFlights endpoint");
            var errorMessage = "Internal server error";
#if DEBUG
            errorMessage = ex.Message;
#endif
            return StatusCode(500, new FlightSearchResponseDto
            {
                Success = false,
                ErrorMessage = errorMessage
            });
        }
    }

    [HttpGet("all")]
    public async Task<ActionResult<FlightSearchResponseDto>> GetAllFlights(
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Create a default search request
            var defaultRequest = new FlightSearchRequestDto
            {
                Origin = "ORD",
                Destination = "ATL",
                DepartureDate = DateTime.Today.AddDays(1),
                AdultCount = 1
            };

            var result = await _searchFlightsUseCase.ExecuteAsync(defaultRequest, cancellationToken);

            if (!result.Success)
            {
                return StatusCode(500, result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetAllFlights endpoint");
            return StatusCode(500, new FlightSearchResponseDto
            {
                Success = false,
                ErrorMessage = "Internal server error"
            });
        }
    }

    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
    }






[HttpGet("agency-tickets")]
    public async Task<IActionResult> SearchAgencyTickets(
        [FromQuery] string origin, 
        [FromQuery] string destination, 
        [FromQuery] string date,
        [FromServices] Microsoft.EntityFrameworkCore.DbContextOptions<FlightSearch.API.Infrastructure.Data.ApplicationDbContext> dbOptions)
    {
        try
        {
            if (!DateTime.TryParse(date, out DateTime depDate))
            {
                depDate = DateTime.Today;
            }

            // ۱. تبدیل به حروف بزرگ را قبل از کوئری انجام میدهیم (بسیار مهم برای سرعت)
            var upperOrigin = origin?.ToUpper() ?? "";
            var upperDest = destination?.ToUpper() ?? "";

            // ۲. تعیین بازه زمانی دقیق برای جستجو در دیتابیس
            var startDate = depDate.Date;
            var endDate = startDate.AddDays(1);

            using var context = new FlightSearch.API.Infrastructure.Data.ApplicationDbContext(dbOptions);

            // ۳. کوئری کاملاً بهینه (بدون ToUpper داخلی)
            // با استفاده از AsNoTracking سرعت خواندن اطلاعات از دیتابیس را بالا میبریم
            var flights = await context.AgencyFlights
                .AsNoTracking()
                .Include(f => f.Agency) 
                .Where(f => f.Origin == upperOrigin && 
                            f.Destination == upperDest && 
                            f.DepartureTime >= startDate && 
                            f.DepartureTime < endDate)
                .Select(f => new 
                {
                    id = f.Id,
                    finalPrice = f.FinalPrice,
                    currency = f.Currency,
                    agencyName = f.Agency != null ? f.Agency.Name : "آژانس نامشخص",
                    agencyProfileImage = f.Agency != null ? f.Agency.ProfileImageUrl : null,
                    rawFlightData = f.RawFlightData // این فیلد سنگین فقط برای رکوردهای پیدا شده از دیتابیس خارج میشود
                })
                .ToListAsync();

            return Ok(new { success = true, flights });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching agency tickets");
            return StatusCode(500, new { success = false, ErrorMessage = "خطا در دریافت بلیط‌های آژانس" });
        }
    }




   [HttpPost("search-raw")]
    public async Task<IActionResult> SearchFlightsRaw(
        [FromBody] FlightSearchRequestDto? request,
        [FromServices] IConfiguration configuration,
        [FromServices] SabreTokenService tokenService,
        [FromServices] IHttpClientFactory httpClientFactory,
        [FromServices] Microsoft.EntityFrameworkCore.DbContextOptions<FlightSearch.API.Infrastructure.Data.ApplicationDbContext> dbOptions, // اضافه شد
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (request == null || string.IsNullOrEmpty(request.Origin) || string.IsNullOrEmpty(request.Destination))
            {
                return BadRequest(new { success = false, errorMessage = "Origin and Destination are required." });
            }

            // خواندن درصد مارک‌آپ از دیتابیس (اگر نبود، مقدار صفر در نظر گرفته می‌شود)
            decimal markupPercentage = 0;
            using (var context = new FlightSearch.API.Infrastructure.Data.ApplicationDbContext(dbOptions))
            {
                var markupSetting = await context.Settings.FirstOrDefaultAsync(s => s.Key == FlightSearch.API.Domain.Entities.Setting.FlightMarkupPercentage);
                if (markupSetting != null && decimal.TryParse(markupSetting.Value, out var parsedMarkup))
                {
                    markupPercentage = parsedMarkup;
                }
            }

            var depDate = request.DepartureDate == default ? DateTime.Today.AddDays(5).ToString("yyyy-MM-dd") : request.DepartureDate.ToString("yyyy-MM-dd");

            var token = await tokenService.GetAccessTokenAsync(cancellationToken);
            var baseUrl = configuration["Sabre:ApiBaseUrl"] ?? "https://api-crt.cert.havail.sabre.com";
            
            var query = $"origin={request.Origin}&destination={request.Destination}&departuredate={depDate}&pointofsalecountry=US";
            var url = $"{baseUrl.TrimEnd('/')}/v1/shop/flights?{query}";

            using var client = httpClientFactory.CreateClient();
            using var sabreRequest = new HttpRequestMessage(HttpMethod.Get, url);
            sabreRequest.Headers.Add("Authorization", $"Bearer {token}");
            sabreRequest.Headers.Add("Accept", "application/json");

            var response = await client.SendAsync(sabreRequest, cancellationToken);
            
            var jsonContent = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound || response.StatusCode == System.Net.HttpStatusCode.BadRequest)
                {
                    // برگرداندن درصد مارک‌آپ حتی در صورت خالی بودن نتایج
                    return Ok(new { success = true, rawData = "{}", markupPercentage }); 
                }
                return StatusCode((int)response.StatusCode, new { success = false, errorMessage = jsonContent });
            }

            // برگرداندن درصد مارک‌آپ همراه با دیتای خام
            return Ok(new { success = true, rawData = jsonContent, markupPercentage });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in SearchFlightsRaw endpoint");
            return StatusCode(500, new { success = false, errorMessage = ex.Message });
        }
    }



}
