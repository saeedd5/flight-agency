namespace FlightSearch.API.Application.DTOs;

/// <summary>
/// DTO for flight search response to API
/// </summary>
public class FlightSearchResponseDto
{
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public List<FlightOptionDto> Flights { get; set; } = new();
    public int ResponseTime { get; set; } // milliseconds
    public string Currency { get; set; } = "USD";
}

public class FlightOptionDto
{
    public string Key { get; set; } = string.Empty;
    public string Airline { get; set; } = string.Empty;
    public string FlightNumber { get; set; } = string.Empty;
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public DateTime DepartureTime { get; set; }
    public DateTime ArrivalTime { get; set; }
    public int FlightTime { get; set; } // minutes
    public int TravelTime { get; set; } // minutes (includes layovers)
    public string? Equipment { get; set; }
    public string? OriginTerminal { get; set; }
    public string? DestinationTerminal { get; set; }
    public int Stops { get; set; }
    public decimal Price { get; set; }
    public string Currency { get; set; } = "USD";
    public string Class { get; set; } = "Economy";
    public List<FlightSegmentDto> Segments { get; set; } = new();
    
    // Additional fields from XML
    public bool? Refundable { get; set; }
    public string? BookingClass { get; set; } // BookingCode from BookingInfo
    public int? BookingCount { get; set; } // Available seats from BookingInfo
    public bool? ChangePenalty { get; set; } // true if ChangePenalty PenaltyApplies exists
    public string? BaggageAllowance { get; set; } // Parsed from BaggageAllowance in FareInfo
    
    // Additional detailed fields from XML
    public int? Distance { get; set; } // Distance in miles
    public string? ETicketability { get; set; } // Yes/No
    public DateTime? LatestTicketingTime { get; set; }
    public string? PricingMethod { get; set; } // Guaranteed, etc.
    public string? PlatingCarrier { get; set; } // Issuing airline
    public bool? CancelPenalty { get; set; } // true if CancelPenalty exists
    public decimal? ChangePenaltyPercentage { get; set; }
    public decimal? ChangePenaltyAmount { get; set; }
    public decimal? CancelPenaltyPercentage { get; set; }
    public string? FareBasis { get; set; } // From FareInfo
    public int? BaggageNumberOfPieces { get; set; } // NumberOfPieces from BaggageAllowance
    public string? PassengerTypeCode { get; set; } // ADT, CNN, INF
    public DateTime? EffectiveDate { get; set; }
    public DateTime? NotValidBefore { get; set; }
    public DateTime? NotValidAfter { get; set; }
    public bool? NegotiatedFare { get; set; }
    public string? BrandId { get; set; }
    public string? BrandTier { get; set; }
    public bool? ChangeOfPlane { get; set; }
    public string? ParticipantLevel { get; set; }
    public string? AvailabilitySource { get; set; }
    public decimal? TotalTaxes { get; set; } // Sum of all taxes
    public List<TaxInfoDto>? Taxes { get; set; } // Detailed tax information
}

public class TaxInfoDto
{
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
}

public class FlightSegmentDto
{
    public string Carrier { get; set; } = string.Empty;
    public string FlightNumber { get; set; } = string.Empty;
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public DateTime DepartureTime { get; set; }
    public DateTime ArrivalTime { get; set; }
    public int FlightTime { get; set; }
    public string? Equipment { get; set; }
}

