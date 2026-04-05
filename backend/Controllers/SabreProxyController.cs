using Microsoft.AspNetCore.Mvc;
using FlightSearch.API.Infrastructure.Providers;
using System.Text.Json;

namespace FlightSearch.API.Controllers;

/// <summary>
/// Proxy controller for Sabre API requests
/// Handles authentication securely on backend
/// </summary>
[ApiController]
[Route("api/sabre")]
public class SabreProxyController : ControllerBase
{
    private readonly SabreTokenService _tokenService;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<SabreProxyController> _logger;

    public SabreProxyController(
        SabreTokenService tokenService,
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<SabreProxyController> logger)
    {
        _tokenService = tokenService;
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// Search flights using Sabre InstaFlights API (proxied through backend)
    /// </summary>
    [HttpGet("instaflights")]
    public async Task<IActionResult> SearchInstaFlights(
        [FromQuery] string origin,
        [FromQuery] string destination,
        [FromQuery] string departuredate,
        [FromQuery] string? returndate = null,
        [FromQuery] string pointofsalecountry = "US",
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Validate inputs
            if (string.IsNullOrWhiteSpace(origin) || origin.Length != 3)
            {
                return BadRequest(new { error = "Invalid origin airport code. Must be 3 letters." });
            }

            if (string.IsNullOrWhiteSpace(destination) || destination.Length != 3)
            {
                return BadRequest(new { error = "Invalid destination airport code. Must be 3 letters." });
            }

            if (string.IsNullOrWhiteSpace(departuredate))
            {
                return BadRequest(new { error = "Departure date is required." });
            }

            // Get token from backend service
            var token = await _tokenService.GetAccessTokenAsync(cancellationToken);
            
            // Build Sabre API URL
            var baseUrl = _configuration["Sabre:ApiBaseUrl"] 
                ?? _configuration["Sabre:CertApiBaseUrl"] 
                ?? "https://api-crt.cert.havail.sabre.com";
            
            var queryParams = $"origin={origin}&destination={destination}&departuredate={departuredate}&pointofsalecountry={pointofsalecountry}";
            if (!string.IsNullOrWhiteSpace(returndate))
            {
                queryParams += $"&returndate={returndate}";
            }

            var url = $"{baseUrl.TrimEnd('/')}/v1/shop/flights?{queryParams}";

            // Make request to Sabre API
            using var client = _httpClientFactory.CreateClient();
            using var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Add("Authorization", $"Bearer {token}");
            request.Headers.Add("Accept", "application/json");

            _logger.LogInformation(
                "Proxying Sabre InstaFlights request: {Origin} -> {Destination} on {DepartureDate}",
                origin, destination, departuredate);

            var response = await client.SendAsync(request, cancellationToken);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogError(
                    "Sabre API error: Status {StatusCode}, Content: {Content}",
                    response.StatusCode, errorContent);
                
                return StatusCode(
                    (int)response.StatusCode,
                    new { error = "Sabre API error", details = errorContent });
            }

            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            
            // Parse and return JSON response
            var jsonDocument = JsonDocument.Parse(content);
            return Ok(jsonDocument.RootElement);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error proxying Sabre InstaFlights request");
            return StatusCode(500, new 
            { 
                error = "Failed to search flights",
                message = ex.Message 
            });
        }
    }

    /// <summary>
    /// Search flights using Sabre Bargain Finder Max API (proxied through backend)
    /// </summary>
    [HttpPost("bargainfinder")]
    public async Task<IActionResult> SearchBargainFinder(
        [FromBody] JsonElement requestBody,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Get token from backend service
            var token = await _tokenService.GetAccessTokenAsync(cancellationToken);
            
            // Build Sabre API URL
            var baseUrl = _configuration["Sabre:ApiBaseUrl"] 
                ?? _configuration["Sabre:CertApiBaseUrl"] 
                ?? "https://api-crt.cert.havail.sabre.com";
            
            var url = $"{baseUrl.TrimEnd('/')}/v5/shop/flights";

            // Make request to Sabre API
            using var client = _httpClientFactory.CreateClient();
            using var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Headers.Add("Authorization", $"Bearer {token}");
            request.Headers.Add("Accept", "application/json");
            request.Content = new StringContent(
                requestBody.GetRawText(),
                System.Text.Encoding.UTF8,
                "application/json");

            _logger.LogInformation("Proxying Sabre Bargain Finder request");

            var response = await client.SendAsync(request, cancellationToken);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogError(
                    "Sabre API error: Status {StatusCode}, Content: {Content}",
                    response.StatusCode, errorContent);
                
                return StatusCode(
                    (int)response.StatusCode,
                    new { error = "Sabre API error", details = errorContent });
            }

            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            
            // Parse and return JSON response
            var jsonDocument = JsonDocument.Parse(content);
            return Ok(jsonDocument.RootElement);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error proxying Sabre Bargain Finder request");
            return StatusCode(500, new 
            { 
                error = "Failed to search flights",
                message = ex.Message 
            });
        }
    }
}
