namespace FlightSearch.API.Infrastructure.Providers;

/// <summary>
/// Additional pricing information for flights
/// </summary>
public class FlightPricingInfo
{
    public bool? Refundable { get; set; }
    public string? BookingClass { get; set; }
    public int? BookingCount { get; set; }
    public bool? ChangePenalty { get; set; }
    public string? BaggageAllowance { get; set; }
    
    // Additional detailed fields
    public int? Distance { get; set; }
    public string? ETicketability { get; set; }
    public DateTime? LatestTicketingTime { get; set; }
    public string? PricingMethod { get; set; }
    public string? PlatingCarrier { get; set; }
    public bool? CancelPenalty { get; set; }
    public decimal? ChangePenaltyPercentage { get; set; }
    public decimal? ChangePenaltyAmount { get; set; }
    public decimal? CancelPenaltyPercentage { get; set; }
    public string? FareBasis { get; set; }
    public int? BaggageNumberOfPieces { get; set; }
    public string? PassengerTypeCode { get; set; }
    public DateTime? EffectiveDate { get; set; }
    public DateTime? NotValidBefore { get; set; }
    public DateTime? NotValidAfter { get; set; }
    public bool? NegotiatedFare { get; set; }
    public string? BrandId { get; set; }
    public string? BrandTier { get; set; }
    public bool? ChangeOfPlane { get; set; }
    public string? ParticipantLevel { get; set; }
    public string? AvailabilitySource { get; set; }
    public decimal? TotalTaxes { get; set; }
    public List<TaxInfoDto>? Taxes { get; set; }
}

public class TaxInfoDto
{
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
}
