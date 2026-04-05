using FlightSearch.API.Domain.Entities;

namespace FlightSearch.API.Domain.Interfaces;

/// <summary>
/// Domain Interface for Flight Search Provider
/// This is in Domain layer - no infrastructure dependencies
/// </summary>
public interface IFlightSearchProvider
{
    /// <summary>
    /// Search for flights based on criteria
    /// Returns domain entities (Flight)
    /// </summary>
    Task<List<Flight>> SearchFlightsAsync(FlightSearchCriteria criteria, CancellationToken cancellationToken = default);
}

