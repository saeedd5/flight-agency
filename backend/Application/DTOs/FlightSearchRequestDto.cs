using System.Text.Json.Serialization;

namespace FlightSearch.API.Application.DTOs;

/// <summary>
/// DTO for incoming flight search request from API
/// </summary>
public class FlightSearchRequestDto
{
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;

    [JsonConverter(typeof(DateOnlyJsonConverter))]
    public DateTime DepartureDate { get; set; }

    [JsonConverter(typeof(NullableDateJsonConverter))]
    public DateTime? ReturnDate { get; set; }
    public int AdultCount { get; set; } = 1;
    public List<int>? ChildAges { get; set; }
    public int InfantCount { get; set; } = 0;
    public string? PreferredCarrier { get; set; }
}

