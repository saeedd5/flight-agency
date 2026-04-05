namespace FlightSearch.API.Domain.Entities;

/// <summary>
/// Domain Entity representing a Flight
/// Contains business rules and validation
/// </summary>
public class Flight
{
    public string Key { get; private set; }
    public string Airline { get; private set; }
    public string FlightNumber { get; private set; }
    public string Origin { get; private set; }
    public string Destination { get; private set; }
    public DateTime DepartureTime { get; private set; }
    public DateTime ArrivalTime { get; private set; }
    public int FlightTime { get; private set; } // minutes
    public int TravelTime { get; private set; } // minutes (includes layovers)
    public string? Equipment { get; private set; }
    public string? OriginTerminal { get; private set; }
    public string? DestinationTerminal { get; private set; }
    public int Stops { get; private set; }
    public decimal Price { get; private set; }
    public string Currency { get; private set; }
    public string Class { get; private set; }
    public List<FlightSegment> Segments { get; private set; }

    private Flight() { } // For EF Core if needed

    public Flight(
        string key,
        string airline,
        string flightNumber,
        string origin,
        string destination,
        DateTime departureTime,
        DateTime arrivalTime,
        int flightTime,
        int travelTime,
        decimal price,
        string currency = "USD",
        string @class = "Economy",
        int stops = 0,
        string? equipment = null,
        string? originTerminal = null,
        string? destinationTerminal = null,
        List<FlightSegment>? segments = null)
    {
        Key = key;
        Airline = airline;
        FlightNumber = flightNumber;
        Origin = origin;
        Destination = destination;
        DepartureTime = departureTime;
        ArrivalTime = arrivalTime;
        FlightTime = flightTime;
        TravelTime = travelTime;
        Price = price;
        Currency = currency;
        Class = @class;
        Stops = stops;
        Equipment = equipment;
        OriginTerminal = originTerminal;
        DestinationTerminal = destinationTerminal;
        Segments = segments ?? new List<FlightSegment>();
        
        Validate();
    }

    /// <summary>
    /// Business rule: Flight must be valid
    /// </summary>
    private void Validate()
    {
        if (string.IsNullOrWhiteSpace(Origin))
            throw new DomainException("Flight origin is required");
            
        if (string.IsNullOrWhiteSpace(Destination))
            throw new DomainException("Flight destination is required");
            
        if (Origin == Destination)
            throw new DomainException("Origin and destination cannot be the same");
            
        if (DepartureTime >= ArrivalTime)
            throw new DomainException("Arrival time must be after departure time");
            
        if (Price < 0)
            throw new DomainException("Price cannot be negative");
    }

    /// <summary>
    /// Business rule: Check if flight is direct
    /// </summary>
    public bool IsDirect() => Stops == 0;

    /// <summary>
    /// Business rule: Check if flight is within price range
    /// </summary>
    public bool IsWithinPriceRange(decimal minPrice, decimal maxPrice)
    {
        return Price >= minPrice && Price <= maxPrice;
    }
}

public class FlightSegment
{
    public string Carrier { get; private set; }
    public string FlightNumber { get; private set; }
    public string Origin { get; private set; }
    public string Destination { get; private set; }
    public DateTime DepartureTime { get; private set; }
    public DateTime ArrivalTime { get; private set; }
    public int FlightTime { get; private set; }
    public string? Equipment { get; private set; }

    private FlightSegment() { }

    public FlightSegment(
        string carrier,
        string flightNumber,
        string origin,
        string destination,
        DateTime departureTime,
        DateTime arrivalTime,
        int flightTime,
        string? equipment = null)
    {
        Carrier = carrier;
        FlightNumber = flightNumber;
        Origin = origin;
        Destination = destination;
        DepartureTime = departureTime;
        ArrivalTime = arrivalTime;
        FlightTime = flightTime;
        Equipment = equipment;
    }
}

public class DomainException : Exception
{
    public DomainException(string message) : base(message) { }
}

