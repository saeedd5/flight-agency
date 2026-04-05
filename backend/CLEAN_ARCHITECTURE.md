# Clean Architecture - Flight Search API

This project is designed using **Clean Architecture**.

## Layer Structure

```
FlightSearch.API/
├── Domain/                    # Core - Business Logic
│   ├── Entities/             # Domain Entities (Flight, FlightSearchCriteria)
│   └── Interfaces/           # Domain Interfaces (IFlightSearchProvider)
│
├── Application/              # Use Cases and DTOs
│   ├── UseCases/             # SearchFlightsUseCase
│   └── DTOs/                 # Request/Response DTOs
│
├── Infrastructure/           # External Implementations
│   └── Providers/            # SabreProvider, SabreShopProvider
│
└── Controllers/              # Presentation Layer
    └── FlightController.cs
```

## Dependency Flow

```
Controllers (Presentation)
    ↓ depends on
Application (Use Cases)
    ↓ depends on
Domain (Interfaces)
    ↑ implemented by
Infrastructure (Providers)
```

## Benefits of Clean Architecture

### 1. Separation of Concerns
- **Domain**: Only Business Logic and rules
- **Application**: Use Cases and Orchestration
- **Infrastructure**: Communication with external world (API, Database, File System)
- **Presentation**: Controllers and API Endpoints

### 2. Dependency Inversion
- Domain Layer has no dependency on Infrastructure
- Infrastructure depends on Domain (implements Interface)
- Provider can be changed without modifying Domain

### 3. Testability
- Domain Entities can be tested without Infrastructure
- Use Cases can be tested with Mock Provider
- Each layer can be tested independently

### 4. Maintainability
- Changes in one layer do not affect other layers
- Adding a new Provider is easy
- Business Rules are centralized in Domain

## Example: Adding a New Provider

To add a new Provider (e.g., Amadeus):

1. **Domain Layer** (no changes):
   - `IFlightSearchProvider` Interface already exists

2. **Infrastructure Layer** (add):
   ```csharp
   public class AmadeusProvider : IFlightSearchProvider
   {
       // Only how to communicate with Amadeus
   }
   ```

3. **Program.cs** (configure DI):
   ```csharp
   builder.Services.AddScoped<IFlightSearchProvider, AmadeusProvider>();
   ```

**Domain and Application remain unchanged!**

## Domain Entities

### Flight
- Business Rules: Validation in Constructor
- Methods: `IsDirect()`, `IsWithinPriceRange()`

### FlightSearchCriteria
- Business Rules: Validation in Constructor
- Methods: `IsRoundTrip()`

## Use Cases

### SearchFlightsUseCase
- Converts DTO to Domain Entity
- Calls Provider
- Converts Domain Entities to DTO
- Error Handling and Logging

## Providers

### SabreProvider
- Implements `IFlightSearchProvider`
- Communication with Sabre REST API
- Uses OAuth 2.0 authentication
- Supports Bargain Finder Max (BFM) API

### SabreShopProvider
- Implements `IFlightSearchProvider`
- Communication with Sabre Shop Flights API
- Uses InstaFlights + Shop Flights for certification

## Dependency Injection

In `Program.cs`:

```csharp
// Infrastructure: Flight Search Provider
var providerType = builder.Configuration["FlightProvider:Type"] ?? "Sabre";

if (providerType.Equals("SabreShop", StringComparison.OrdinalIgnoreCase))
{
    builder.Services.AddHttpClient<SabreShopProvider>();
    builder.Services.AddScoped<IFlightSearchProvider, SabreShopProvider>();
}
else
{
    builder.Services.AddHttpClient<SabreProvider>(client =>
    {
        client.BaseAddress = new Uri("https://api.sabre.com");
        client.Timeout = TimeSpan.FromSeconds(120);
    });
    builder.Services.AddScoped<IFlightSearchProvider, SabreProvider>();
}

// Application
builder.Services.AddScoped<SearchFlightsUseCase>();
```

## Comparison with Previous Architecture

### Before (Layered Architecture):
- Service Layer had everything together
- Business Logic + Infrastructure Logic mixed
- Changing Provider was difficult

### Now (Clean Architecture):
- Domain is independent of Infrastructure
- Each layer has a specific responsibility
- Changing Provider is easy
- Better testability

## Important Notes

1. **Domain Layer** has no using statements to Infrastructure
2. **Application Layer** only depends on Domain
3. **Infrastructure** implements Domain Interfaces
4. **Controllers** only call Use Cases

## Data Flow Example

```
User Request (DTO)
    ↓
Controller
    ↓
SearchFlightsUseCase
    ↓
FlightSearchCriteria (Domain Entity) - Validation
    ↓
IFlightSearchProvider (Domain Interface)
    ↓
SabreProvider (Infrastructure Implementation)
    ↓
List<Flight> (Domain Entities)
    ↓
SearchFlightsUseCase (Mapping to DTO)
    ↓
Response (DTO)
```

## Testing

To test each layer:

```csharp
// Domain Test
var flight = new Flight(...); // without Infrastructure

// Use Case Test
var mockProvider = new Mock<IFlightSearchProvider>();
var useCase = new SearchFlightsUseCase(mockProvider.Object, logger);

// Provider Test
var provider = new SabreProvider(httpClient, config, logger);
```

