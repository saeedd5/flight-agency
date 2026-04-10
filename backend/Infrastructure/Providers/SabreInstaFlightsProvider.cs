// //backend/Infrastructure/Providers/SabreInstaFlightsProvider.cs :


// using System.Text.Json;
// using FlightSearch.API.Domain.Entities;
// using FlightSearch.API.Domain.Interfaces;

// namespace FlightSearch.API.Infrastructure.Providers;

// /// <summary>
// /// Sabre InstaFlights API provider - returns real flight data from Sabre (no mock)
// /// </summary>
// public class SabreInstaFlightsProvider : IFlightSearchProvider
// {
//     private readonly IHttpClientFactory _httpClientFactory;
//     private readonly SabreTokenService _tokenService;
//     private readonly IConfiguration _configuration;
//     private readonly ILogger<SabreInstaFlightsProvider> _logger;
//     private readonly ISettingRepository _settingRepository;

//     public SabreInstaFlightsProvider(
//         IHttpClientFactory httpClientFactory,
//         SabreTokenService tokenService,
//         IConfiguration configuration,
//         ILogger<SabreInstaFlightsProvider> logger,
//         ISettingRepository settingRepository)
//     {
//         _httpClientFactory = httpClientFactory;
//         _tokenService = tokenService;
//         _configuration = configuration;
//         _logger = logger;
//         _settingRepository = settingRepository;
//     }

//     public async Task<List<Flight>> SearchFlightsAsync(
//         FlightSearchCriteria criteria,
//         CancellationToken cancellationToken = default)
//     {
//         _logger.LogInformation(
//             "Sabre: Searching flights: {Origin} -> {Destination} on {DepartureDate}",
//             criteria.Origin, criteria.Destination, criteria.DepartureDate);

//         try
//         {

//                var markupSetting = await _settingRepository.GetByKeyAsync(Setting.FlightMarkupPercentage);
//             decimal markupMultiplier = 1.0m;
//             if (markupSetting != null && decimal.TryParse(markupSetting.Value, out var percentage))
//             {
//                 markupMultiplier = 1.0m + (percentage / 100m);
//             }



//             var token = await _tokenService.GetAccessTokenAsync(cancellationToken);
//             var baseUrl = _configuration["Sabre:ApiBaseUrl"] ?? _configuration["Sabre:CertApiBaseUrl"] ?? "https://api-crt.cert.havail.sabre.com";
//             var depDate = criteria.DepartureDate.ToString("yyyy-MM-dd");
//             var query = $"origin={criteria.Origin}&destination={criteria.Destination}&departuredate={depDate}&pointofsalecountry=US";
//             var url = $"{baseUrl.TrimEnd('/')}/v1/shop/flights?{query}";

//             using var client = _httpClientFactory.CreateClient();
//             using var request = new HttpRequestMessage(HttpMethod.Get, url);
//             request.Headers.Add("Authorization", $"Bearer {token}");
//             request.Headers.Add("Accept", "application/json");

//             var response = await client.SendAsync(request, cancellationToken);
//             response.EnsureSuccessStatusCode();

//             var json = await response.Content.ReadAsStringAsync(cancellationToken);
//             return ParseSabreResponse(json, criteria.Origin, criteria.Destination, markupMultiplier);
//         }
//         catch (Exception ex)
//         {
//             _logger.LogError(ex, "Sabre InstaFlights API error");
//             throw new DomainException($"Sabre API error: {ex.Message}");
//         }
//     }

//             private static List<Flight> ParseSabreResponse(string json, string origin, string destination, decimal markupMultiplier) // <-- تغییر
//     {
//         var flights = new List<Flight>();
//         using var doc = JsonDocument.Parse(json);
//         var root = doc.RootElement;

//         JsonElement pricedItineraries;
//         if (root.TryGetProperty("PricedItineraries", out pricedItineraries))
//         { }
//         else if (root.TryGetProperty("OTA_AirLowFareSearchRS", out var ota) &&
//                  ota.TryGetProperty("PricedItineraries", out pricedItineraries))
//         { }
//         else
//             return flights;

//         var array = pricedItineraries.ValueKind == JsonValueKind.Array ? pricedItineraries : default;
//         var items = array.ValueKind == JsonValueKind.Array
//             ? pricedItineraries.EnumerateArray()
//             : pricedItineraries.TryGetProperty("PricedItinerary", out var pi)
//                 ? (pi.ValueKind == JsonValueKind.Array ? pi.EnumerateArray() : new[] { pi }.AsEnumerable())
//                 : Array.Empty<JsonElement>().AsEnumerable();

//         var idx = 0;
//         foreach (var itinerary in items)
//         {
//             try
//             {
//                 var flight = ParseItinerary(itinerary, origin, destination, idx++, markupMultiplier); // <-- تغییر
//                 if (flight != null)
//                     flights.Add(flight);
//             }
//             catch
//             {
//                 // Skip invalid itineraries
//             }
//         }

//         return flights;
//     }

//             private static Flight? ParseItinerary(JsonElement itinerary, string origin, string destination, int index, decimal markupMultiplier) // <-- تغییر
//     {
//         if (!itinerary.TryGetProperty("AirItinerary", out var airItinerary) ||
//             !itinerary.TryGetProperty("AirItineraryPricingInfo", out var pricingInfo))
//             return null;

//         if (!airItinerary.TryGetProperty("OriginDestinationOptions", out var odOptions) ||
//             !odOptions.TryGetProperty("OriginDestinationOption", out var odOption))
//             return null;

//         var option = odOption.ValueKind == JsonValueKind.Array ? odOption[0] : odOption;
//         if (!option.TryGetProperty("FlightSegment", out var segmentsEl))
//             return null;

//         var segmentsArray = segmentsEl.ValueKind == JsonValueKind.Array
//             ? segmentsEl.EnumerateArray()
//             : new[] { segmentsEl }.AsEnumerable();

//         var segments = new List<FlightSegment>();
//         DateTime? depTime = null;
//         DateTime? arrTime = null;
//         var totalFlightTime = 0;

//         foreach (var seg in segmentsArray)
//         {
//             if (!seg.TryGetProperty("DepartureDateTime", out var depEl) || !seg.TryGetProperty("ArrivalDateTime", out var arrEl))
//                 continue;
//             var depStr = depEl.GetString();
//             var arrStr = arrEl.GetString();
//             if (string.IsNullOrEmpty(depStr) || string.IsNullOrEmpty(arrStr))
//                 continue;
//             if (!DateTime.TryParse(depStr, out var dep) || !DateTime.TryParse(arrStr, out var arr))
//                 continue;

//             var flightTime = (int)(arr - dep).TotalMinutes;
//             totalFlightTime += flightTime;
//             if (depTime == null) depTime = dep;
//             arrTime = arr;

//             var segOrigin = seg.TryGetProperty("DepartureAirport", out var da) && da.TryGetProperty("LocationCode", out var daLoc)
//                 ? daLoc.GetString() ?? ""
//                 : "";
//             var segDest = seg.TryGetProperty("ArrivalAirport", out var aa) && aa.TryGetProperty("LocationCode", out var aaLoc)
//                 ? aaLoc.GetString() ?? ""
//                 : "";
//             var carrier = seg.TryGetProperty("MarketingAirline", out var ma) && ma.TryGetProperty("Code", out var maCode)
//                 ? maCode.GetString() ?? ""
//                 : "";
//             var fn = seg.TryGetProperty("FlightNumber", out var fnEl) ? fnEl.GetString() ?? "" : "";

//             segments.Add(new FlightSegment(carrier, fn, segOrigin, segDest, dep, arr, flightTime, null));
//         }

//         if (!depTime.HasValue || !arrTime.HasValue || segments.Count == 0)
//             return null;

//         var totalPrice = 0m;
//         var currency = "USD";
//         if (pricingInfo.TryGetProperty("ItinTotalFare", out var totalFare) &&
//             totalFare.TryGetProperty("TotalFare", out var tf))
//         {
//             if (tf.TryGetProperty("Amount", out var amt))
//                 totalPrice = amt.TryGetDecimal(out var v) ? v : 0;
//             if (tf.TryGetProperty("CurrencyCode", out var cc))
//                 currency = cc.GetString() ?? "USD";
//         }

//                 totalPrice = Math.Round(totalPrice * markupMultiplier, 2);


//         var firstSeg = segments[0];
//         var key = $"sabre-{index}-{firstSeg.Carrier}{firstSeg.FlightNumber}-{origin}-{destination}";
//         var travelTime = (int)(arrTime.Value - depTime.Value).TotalMinutes;

//         return new Flight(
//             key,
//             firstSeg.Carrier,
//             firstSeg.FlightNumber,
//             origin,
//             destination,
//             depTime.Value,
//             arrTime.Value,
//             totalFlightTime,
//             travelTime,
//             totalPrice,
//             currency,
//             "Economy",
//             segments.Count - 1,
//             null,
//             null,
//             null,
//             segments);
//     }
// }

using System.Text.Json;
using FlightSearch.API.Domain.Entities;
using FlightSearch.API.Domain.Interfaces;

namespace FlightSearch.API.Infrastructure.Providers;

public class SabreInstaFlightsProvider : IFlightSearchProvider
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly SabreTokenService _tokenService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<SabreInstaFlightsProvider> _logger;
    private readonly ISettingRepository _settingRepository;

    public SabreInstaFlightsProvider(
        IHttpClientFactory httpClientFactory,
        SabreTokenService tokenService,
        IConfiguration configuration,
        ILogger<SabreInstaFlightsProvider> logger,
        ISettingRepository settingRepository)
    {
        _httpClientFactory = httpClientFactory;
        _tokenService = tokenService;
        _configuration = configuration;
        _logger = logger;
        _settingRepository = settingRepository;
    }

    public async Task<List<Flight>> SearchFlightsAsync(
        FlightSearchCriteria criteria,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Sabre: Searching flights: {Origin} -> {Destination} on {DepartureDate}", criteria.Origin, criteria.Destination, criteria.DepartureDate);

        try
        {
            var markupSetting = await _settingRepository.GetByKeyAsync(Setting.FlightMarkupPercentage);
            decimal markupMultiplier = 1.0m + (decimal.TryParse(markupSetting?.Value, out var p) ? p / 100m : 0);

            var token = await _tokenService.GetAccessTokenAsync(cancellationToken);
            var baseUrl = _configuration["Sabre:ApiBaseUrl"] ?? "https://api-crt.cert.havail.sabre.com";
            var depDate = criteria.DepartureDate.ToString("yyyy-MM-dd");
            var query = $"origin={criteria.Origin}&destination={criteria.Destination}&departuredate={depDate}&pointofsalecountry=US";
            var url = $"{baseUrl.TrimEnd('/')}/v1/shop/flights?{query}";

            using var client = _httpClientFactory.CreateClient();
            using var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Add("Authorization", $"Bearer {token}");
            request.Headers.Add("Accept", "application/json");

            var response = await client.SendAsync(request, cancellationToken);
            
            if (!response.IsSuccessStatusCode)
            {
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return new List<Flight>();
                throw new DomainException($"Sabre API Error: {response.StatusCode}");
            }

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            if (string.IsNullOrWhiteSpace(json)) return new List<Flight>();

            return ParseSabreResponse(json, criteria.Origin, criteria.Destination, markupMultiplier);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Sabre InstaFlights API error");
            throw new DomainException($"ارتباط با سیستم پروازها برقرار نشد: {ex.Message}");
        }
    }

    private List<Flight> ParseSabreResponse(string json, string origin, string destination, decimal markupMultiplier)
    {
        var flights = new List<Flight>();
        try
        {
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            JsonElement pricedItineraries;
            if (root.TryGetProperty("PricedItineraries", out pricedItineraries) && pricedItineraries.ValueKind == JsonValueKind.Object && pricedItineraries.TryGetProperty("PricedItinerary", out var itineraries)) { }
            else if (root.TryGetProperty("PricedItineraries", out pricedItineraries) && pricedItineraries.ValueKind == JsonValueKind.Array) itineraries = pricedItineraries;
            else if (root.TryGetProperty("OTA_AirLowFareSearchRS", out var ota) && ota.TryGetProperty("PricedItineraries", out pricedItineraries) && pricedItineraries.TryGetProperty("PricedItinerary", out itineraries)) { }
            else return flights;

            var items = itineraries.ValueKind == JsonValueKind.Array ? itineraries.EnumerateArray() : new[] { itineraries }.AsEnumerable();
            var idx = 0;
            
            foreach (var itinerary in items)
            {
                try
                {
                    var flight = ParseItinerary(itinerary, origin, destination, idx++, markupMultiplier);
                    if (flight != null) flights.Add(flight);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning($"Failed to parse a single itinerary: {ex.Message}");
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError($"Fatal error during JSON parsing: {ex.Message}");
        }
        return flights;
    }
    
    private static Flight? ParseItinerary(JsonElement itinerary, string origin, string destination, int index, decimal markupMultiplier)
    {
        if (!itinerary.TryGetProperty("AirItinerary", out var airItinerary) || !airItinerary.TryGetProperty("OriginDestinationOptions", out var odOptions) || !odOptions.TryGetProperty("OriginDestinationOption", out var odOption)) return null;

        var option = odOption.ValueKind == JsonValueKind.Array ? odOption[0] : odOption;
        if (!option.TryGetProperty("FlightSegment", out var segmentsEl)) return null;

        var segmentsArray = segmentsEl.ValueKind == JsonValueKind.Array ? segmentsEl.EnumerateArray() : new[] { segmentsEl }.AsEnumerable();
        var segments = new List<FlightSegment>();
        DateTime? depTime = null, arrTime = null;
        int totalFlightTime = 0;

        foreach (var seg in segmentsArray)
        {
            // --- تغییر جادویی: استفاده از ToString به جای GetString ---
            var depStr = seg.TryGetProperty("DepartureDateTime", out var dDt) ? dDt.ToString() : "";
            var arrStr = seg.TryGetProperty("ArrivalDateTime", out var aDt) ? aDt.ToString() : "";
            
            if (!DateTime.TryParse(depStr, out var dep) || !DateTime.TryParse(arrStr, out var arr)) continue;

            var flightTime = (int)(arr - dep).TotalMinutes;
            totalFlightTime += flightTime;
            if (depTime == null) depTime = dep;
            arrTime = arr;

            // استفاده از ToString برای جلوگیری از ارور Number
            var segOrigin = seg.TryGetProperty("DepartureAirport", out var da) && da.TryGetProperty("LocationCode", out var daLoc) ? daLoc.ToString() : "";
            var segDest = seg.TryGetProperty("ArrivalAirport", out var aa) && aa.TryGetProperty("LocationCode", out var aaLoc) ? aaLoc.ToString() : "";
            var carrier = seg.TryGetProperty("MarketingAirline", out var ma) && ma.TryGetProperty("Code", out var maCode) ? maCode.ToString() : "";
            var fn = seg.TryGetProperty("FlightNumber", out var fnEl) ? fnEl.ToString() : "";

            segments.Add(new FlightSegment(carrier, fn, segOrigin, segDest, dep, arr, flightTime, null));
        }

        if (!depTime.HasValue || !arrTime.HasValue || segments.Count == 0) return null;

        decimal totalPrice = 0;
        string currency = "USD";
        if(itinerary.TryGetProperty("AirItineraryPricingInfo", out var pricingInfos))
        {
            var pricingInfo = pricingInfos.ValueKind == JsonValueKind.Array ? pricingInfos[0] : pricingInfos;
            if (pricingInfo.TryGetProperty("ItinTotalFare", out var itinTotalFare) && itinTotalFare.TryGetProperty("TotalFare", out var totalFare))
            {
                // خواندن امن قیمت (چه عدد باشد چه متن)
                if (totalFare.TryGetProperty("Amount", out var amount))
                {
                    totalPrice = amount.ValueKind == JsonValueKind.Number ? amount.GetDecimal() : (decimal.TryParse(amount.ToString(), out var v) ? v : 0);
                }
                
                if (totalFare.TryGetProperty("CurrencyCode", out var ccy))
                {
                    currency = ccy.ToString();
                }
            }
        }
        
        totalPrice = Math.Round(totalPrice * markupMultiplier, 2);

        var firstSeg = segments[0];
        return new Flight($"sabre-{index}-{firstSeg.Carrier}{firstSeg.FlightNumber}-{origin}-{destination}", firstSeg.Carrier, firstSeg.FlightNumber, origin, destination, depTime.Value, arrTime.Value, totalFlightTime, (int)(arrTime.Value - depTime.Value).TotalMinutes, totalPrice, currency, "Economy", segments.Count - 1, null, null, null, segments);
    }
}