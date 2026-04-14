using Microsoft.AspNetCore.Mvc;
using FlightSearch.API.Infrastructure.Providers;
using FlightSearch.API.Domain.Interfaces;
using FlightSearch.API.Domain.Entities;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace FlightSearch.API.Controllers;

[ApiController]
[Route("api/sabre")]
public class SabreProxyController : ControllerBase
{
    private readonly SabreTokenService _tokenService;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<SabreProxyController> _logger;
    private readonly ISettingRepository _settingRepository;

    public SabreProxyController(
        SabreTokenService tokenService,
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<SabreProxyController> logger,
        ISettingRepository settingRepository) // <-- تزریق تنظیمات
    {
        _tokenService = tokenService;
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
        _settingRepository = settingRepository;
    }

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
            if (string.IsNullOrWhiteSpace(origin) || origin.Length != 3)
                return BadRequest(new { error = "Invalid origin airport code. Must be 3 letters." });
            if (string.IsNullOrWhiteSpace(destination) || destination.Length != 3)
                return BadRequest(new { error = "Invalid destination airport code. Must be 3 letters." });
            if (string.IsNullOrWhiteSpace(departuredate))
                return BadRequest(new { error = "Departure date is required." });

            var token = await _tokenService.GetAccessTokenAsync(cancellationToken);
            var baseUrl = _configuration["Sabre:ApiBaseUrl"] ?? _configuration["Sabre:CertApiBaseUrl"] ?? "https://api-crt.cert.havail.sabre.com";
            
            var queryParams = $"origin={origin}&destination={destination}&departuredate={departuredate}&pointofsalecountry={pointofsalecountry}";
            if (!string.IsNullOrWhiteSpace(returndate)) queryParams += $"&returndate={returndate}";

            var url = $"{baseUrl.TrimEnd('/')}/v1/shop/flights?{queryParams}";

            using var client = _httpClientFactory.CreateClient();
            using var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Add("Authorization", $"Bearer {token}");
            request.Headers.Add("Accept", "application/json");

            var response = await client.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode)
                return StatusCode((int)response.StatusCode, new { error = "Sabre API error", details = await response.Content.ReadAsStringAsync(cancellationToken) });

            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            
            // اعمال سود سیستم (Markup) روی JSON
            return await ApplyMarkupAndReturn(content);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error proxying Sabre InstaFlights request");
            return StatusCode(500, new { error = "Failed to search flights", message = ex.Message });
        }
    }

    [HttpPost("bargainfinder")]
    public async Task<IActionResult> SearchBargainFinder([FromBody] JsonElement requestBody, CancellationToken cancellationToken = default)
    {
        try
        {
            var token = await _tokenService.GetAccessTokenAsync(cancellationToken);
            var baseUrl = _configuration["Sabre:ApiBaseUrl"] ?? _configuration["Sabre:CertApiBaseUrl"] ?? "https://api-crt.cert.havail.sabre.com";
            var url = $"{baseUrl.TrimEnd('/')}/v5/shop/flights";

            using var client = _httpClientFactory.CreateClient();
            using var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Headers.Add("Authorization", $"Bearer {token}");
            request.Headers.Add("Accept", "application/json");
            request.Content = new StringContent(requestBody.GetRawText(), System.Text.Encoding.UTF8, "application/json");

            var response = await client.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode)
                return StatusCode((int)response.StatusCode, new { error = "Sabre API error", details = await response.Content.ReadAsStringAsync(cancellationToken) });

            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            
            // اعمال سود سیستم (Markup) روی JSON
            return await ApplyMarkupAndReturn(content);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error proxying Sabre Bargain Finder request");
            return StatusCode(500, new { error = "Failed to search flights", message = ex.Message });
        }
    }


    private async Task<IActionResult> ApplyMarkupAndReturn(string jsonContent)
    {
        var markupSetting = await _settingRepository.GetByKeyAsync(Setting.FlightMarkupPercentage);
        decimal markupMultiplier = 1.0m;
        
        if (markupSetting != null && decimal.TryParse(markupSetting.Value, out var percentage))
        {
            markupMultiplier = 1.0m + (percentage / 100m); 

        if (markupMultiplier == 1.0m)
        {
            return Ok(JsonDocument.Parse(jsonContent).RootElement);
        }

        var jsonNode = JsonNode.Parse(jsonContent);
        TraverseAndApplyMarkup(jsonNode, markupMultiplier);
        
        return Ok(jsonNode);
    }

private void TraverseAndApplyMarkup(JsonNode? node, decimal multiplier)
    {
        if (node is JsonObject obj)
        {
            if (obj.ContainsKey("Amount") && obj.ContainsKey("CurrencyCode"))
            {
                var amountToken = obj["Amount"];
                
                if (amountToken is JsonValue jsonValue)
                {
                    if (jsonValue.TryGetValue<decimal>(out var numValue))
                    {
                        obj["Amount"] = Math.Round(numValue * multiplier, 2);
                    }
                    else if (jsonValue.TryGetValue<string>(out var strValue) && decimal.TryParse(strValue, out var parsedValue))
                    {
                        obj["Amount"] = Math.Round(parsedValue * multiplier, 2).ToString("0.00");
                    }
                }
            }

            foreach (var kvp in obj.ToArray())
            {
                TraverseAndApplyMarkup(kvp.Value, multiplier);
            }
        }
        else if (node is JsonArray arr)
        {
            foreach (var item in arr)
            {
                TraverseAndApplyMarkup(item, multiplier);
            }
        }
    }
}