namespace FlightSearch.API.Domain.Entities;

/// <summary>
/// Value Object representing search criteria
/// Contains business rules for search validation
/// </summary>
public class FlightSearchCriteria
{
    public string Origin { get; private set; }
    public string Destination { get; private set; }
    public DateTime DepartureDate { get; private set; }
    public DateTime? ReturnDate { get; private set; }
    public int AdultCount { get; private set; }
    public List<int>? ChildAges { get; private set; }
    public int InfantCount { get; private set; }
    public string? PreferredCarrier { get; private set; }

    private FlightSearchCriteria() { }

    public FlightSearchCriteria(
        string origin,
        string destination,
        DateTime departureDate,
        DateTime? returnDate = null,
        int adultCount = 1,
        List<int>? childAges = null,
        int infantCount = 0,
        string? preferredCarrier = null)
    {
        Origin = origin;
        Destination = destination;
        DepartureDate = departureDate;
        ReturnDate = returnDate;
        AdultCount = adultCount;
        ChildAges = childAges;
        InfantCount = infantCount;
        PreferredCarrier = preferredCarrier;
        
        Validate();
    }

    /// <summary>
    /// Business rules for search criteria validation
    /// </summary>
    private void Validate()
    {
        if (string.IsNullOrWhiteSpace(Origin))
            throw new DomainException("Origin airport code is required");
            
        if (string.IsNullOrWhiteSpace(Destination))
            throw new DomainException("Destination airport code is required");
            
        if (Origin == Destination)
            throw new DomainException("Origin and destination cannot be the same");
            
        if (DepartureDate.Date < DateTime.Today)
            throw new DomainException("Departure date cannot be in the past");
            
        if (ReturnDate.HasValue && ReturnDate.Value <= DepartureDate)
            throw new DomainException("Return date must be after departure date");
            
        if (AdultCount < 1)
            throw new DomainException("At least one adult passenger is required");
            
        if (AdultCount + (ChildAges?.Count ?? 0) + InfantCount > 9)
            throw new DomainException("Maximum 9 passengers allowed");
    }

    /// <summary>
    /// Business rule: Check if it's a round trip
    /// </summary>
    public bool IsRoundTrip() => ReturnDate.HasValue;
}

