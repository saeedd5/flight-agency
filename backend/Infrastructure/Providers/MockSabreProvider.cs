using FlightSearch.API.Domain.Entities;
using FlightSearch.API.Domain.Interfaces;

namespace FlightSearch.API.Infrastructure.Providers;

/// <summary>
/// Mock Sabre Provider for testing - returns sample flights
/// </summary>
public class MockSabreProvider : IFlightSearchProvider
{
    private readonly ILogger<MockSabreProvider> _logger;

    public MockSabreProvider(ILogger<MockSabreProvider> logger)
    {
        _logger = logger;
    }

    public async Task<List<Flight>> SearchFlightsAsync(
        FlightSearchCriteria criteria,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Mock: Searching flights: {Origin} -> {Destination} on {DepartureDate}",
            criteria.Origin, criteria.Destination, criteria.DepartureDate);

        // Simulate API delay
        await Task.Delay(500, cancellationToken);

        var flights = new List<Flight>();

        // Generate sample flights
        var baseDeparture = criteria.DepartureDate.Date.AddHours(8);
        var airlines = new[] { "AA", "UA", "DL", "BA", "LH" };
        var prices = new[] { 299.99m, 349.99m, 399.99m, 449.99m, 499.99m };

        for (int i = 0; i < 10; i++)
        {
            var airline = airlines[i % airlines.Length];
            var departureTime = baseDeparture.AddHours(i * 2);
            var arrivalTime = departureTime.AddHours(5).AddMinutes(30);
            var flightTime = 330; // 5h 30m in minutes
            var price = prices[i % prices.Length];
            var stops = i % 3; // 0, 1, or 2 stops

            var segments = new List<FlightSegment>();
            
            if (stops == 0)
            {
                // Direct flight
                segments.Add(new FlightSegment(
                    carrier: airline,
                    flightNumber: $"{airline}{1000 + i}",
                    origin: criteria.Origin,
                    destination: criteria.Destination,
                    departureTime: departureTime,
                    arrivalTime: arrivalTime,
                    flightTime: flightTime,
                    equipment: "B737"
                ));
            }
            else if (stops == 1)
            {
                // One stop flight
                var layoverAirport = "ORD";
                var layoverTime = departureTime.AddHours(3);
                var layoverDeparture = layoverTime.AddMinutes(45);

                segments.Add(new FlightSegment(
                    carrier: airline,
                    flightNumber: $"{airline}{1000 + i}",
                    origin: criteria.Origin,
                    destination: layoverAirport,
                    departureTime: departureTime,
                    arrivalTime: layoverTime,
                    flightTime: 180,
                    equipment: "B737"
                ));

                segments.Add(new FlightSegment(
                    carrier: airline,
                    flightNumber: $"{airline}{2000 + i}",
                    origin: layoverAirport,
                    destination: criteria.Destination,
                    departureTime: layoverDeparture,
                    arrivalTime: arrivalTime,
                    flightTime: 150,
                    equipment: "B737"
                ));
            }
            else
            {
                // Two stops flight
                var stop1 = "ORD";
                var stop2 = "DFW";
                var stop1Time = departureTime.AddHours(2);
                var stop1Departure = stop1Time.AddMinutes(60);
                var stop2Time = stop1Departure.AddHours(2);
                var stop2Departure = stop2Time.AddMinutes(60);

                segments.Add(new FlightSegment(
                    carrier: airline,
                    flightNumber: $"{airline}{1000 + i}",
                    origin: criteria.Origin,
                    destination: stop1,
                    departureTime: departureTime,
                    arrivalTime: stop1Time,
                    flightTime: 120,
                    equipment: "B737"
                ));

                segments.Add(new FlightSegment(
                    carrier: airline,
                    flightNumber: $"{airline}{2000 + i}",
                    origin: stop1,
                    destination: stop2,
                    departureTime: stop1Departure,
                    arrivalTime: stop2Time,
                    flightTime: 120,
                    equipment: "B737"
                ));

                segments.Add(new FlightSegment(
                    carrier: airline,
                    flightNumber: $"{airline}{3000 + i}",
                    origin: stop2,
                    destination: criteria.Destination,
                    departureTime: stop2Departure,
                    arrivalTime: arrivalTime,
                    flightTime: 90,
                    equipment: "B737"
                ));
            }

            var flight = new Flight(
                key: $"MOCK-{i}-{airline}-{criteria.Origin}-{criteria.Destination}",
                airline: airline,
                flightNumber: segments[0].FlightNumber,
                origin: criteria.Origin,
                destination: criteria.Destination,
                departureTime: departureTime,
                arrivalTime: arrivalTime,
                flightTime: segments.Sum(s => s.FlightTime),
                travelTime: (int)(arrivalTime - departureTime).TotalMinutes,
                price: price,
                currency: "USD",
                @class: "Economy",
                stops: stops,
                equipment: "B737",
                segments: segments
            );

            flights.Add(flight);
        }

        _logger.LogInformation("Mock: Returning {Count} sample flights", flights.Count);
        return flights;
    }
}
