using System.Text.Json;
using System.Globalization;

namespace FlightSearch.API.Infrastructure.Providers;

public interface ITranslationService
{
    string Translate(string entity, string key, string fallbackValue);
}

public class JsonTranslationService : ITranslationService
{
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<JsonTranslationService> _logger;
    private Dictionary<string, Dictionary<string, string>> _cache = new();

    public JsonTranslationService(IWebHostEnvironment env, ILogger<JsonTranslationService> logger)
    {
        _env = env;
        _logger = logger;
    }

    public string Translate(string entity, string key, string fallbackValue)
    {
        var currentLang = CultureInfo.CurrentCulture.Name; // e.g., "en" or "ar-IQ"
        
        var cacheKey = $"{entity}_{currentLang}";

        if (!_cache.ContainsKey(cacheKey))
        {
            var filePath = Path.Combine(_env.ContentRootPath, "Translations", $"{entity}.{currentLang}.json");
            
            if (File.Exists(filePath))
            {
                try
                {
                    var json = File.ReadAllText(filePath);
                    var dict = JsonSerializer.Deserialize<Dictionary<string, string>>(json);
                    _cache[cacheKey] = dict ?? new Dictionary<string, string>();
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to parse translation file {file}", filePath);
                    _cache[cacheKey] = new Dictionary<string, string>();
                }
            }
            else
            {

                _cache[cacheKey] = new Dictionary<string, string>();
            }
        }


        if (_cache[cacheKey].TryGetValue(key, out var translatedValue))
        {
            return translatedValue;
        }

        return fallbackValue;
    }
}