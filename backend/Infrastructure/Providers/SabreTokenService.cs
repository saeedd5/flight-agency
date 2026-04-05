using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace FlightSearch.API.Infrastructure.Providers;

/// <summary>
/// Service for managing Sabre OAuth 2.0 authentication tokens
/// </summary>
public class SabreTokenService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<SabreTokenService> _logger;
    private string? _cachedToken;
    private DateTime _tokenExpiry = DateTime.MinValue;

    public SabreTokenService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<SabreTokenService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// Get valid OAuth 2.0 access token from Sabre
    /// </summary>
    public async Task<string> GetAccessTokenAsync(CancellationToken cancellationToken = default)
    {
        // Return cached token if still valid (with 5 minute buffer)
        if (!string.IsNullOrEmpty(_cachedToken) && DateTime.UtcNow < _tokenExpiry.AddMinutes(-5))
        {
            return _cachedToken;
        }

        try
        {
            var clientId = _configuration["Sabre:ClientId"];
            var clientSecret = _configuration["Sabre:ClientSecret"];
            var tokenUrl = _configuration["Sabre:TokenUrl"] ?? "https://api.sabre.com/v2/auth/token";

            if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret) ||
                clientId == "YOUR_SABRE_CLIENT_ID" || clientSecret == "YOUR_SABRE_CLIENT_SECRET")
            {
                throw new InvalidOperationException(
                    "Sabre ClientId and ClientSecret must be configured in appsettings.json. " +
                    "Please replace YOUR_SABRE_CLIENT_ID and YOUR_SABRE_CLIENT_SECRET with your actual credentials.");
            }

            // Prepare OAuth 2.0 request with Sabre's special double base64 encoding
            // Sabre requires: base64(base64(clientId):base64(clientSecret))
            var b64UserId = Convert.ToBase64String(Encoding.UTF8.GetBytes(clientId));
            var b64Password = Convert.ToBase64String(Encoding.UTF8.GetBytes(clientSecret));
            var credentials = Convert.ToBase64String(
                Encoding.UTF8.GetBytes($"{b64UserId}:{b64Password}"));

            var request = new HttpRequestMessage(HttpMethod.Post, tokenUrl);
            request.Headers.Add("Authorization", $"Basic {credentials}");
            request.Content = new StringContent(
                "grant_type=client_credentials",
                Encoding.UTF8,
                "application/x-www-form-urlencoded");

            _logger.LogInformation("Requesting OAuth token from Sabre...");

            var response = await _httpClient.SendAsync(request, cancellationToken);
            response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
            var tokenResponse = JsonSerializer.Deserialize<SabreTokenResponse>(responseContent);

            if (tokenResponse == null || string.IsNullOrEmpty(tokenResponse.AccessToken))
            {
                throw new InvalidOperationException("Failed to obtain access token from Sabre");
            }

            // Cache token (Sabre tokens typically expire in 1 hour)
            _cachedToken = tokenResponse.AccessToken;
            _tokenExpiry = DateTime.UtcNow.AddSeconds(tokenResponse.ExpiresIn - 300); // 5 min buffer

            _logger.LogInformation("Successfully obtained Sabre access token");
            return _cachedToken;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error obtaining Sabre access token");
            throw;
        }
    }

    private class SabreTokenResponse
    {
        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; } = string.Empty;

        [JsonPropertyName("token_type")]
        public string TokenType { get; set; } = "Bearer";

        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; }
    }
}
