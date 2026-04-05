using System.Text.Json;
using System.Text.Json.Serialization;

namespace FlightSearch.API.Application.DTOs;

/// <summary>
/// JSON converter that accepts both date-only ("2025-02-27") and full ISO 8601 DateTime strings.
/// </summary>
public class DateOnlyJsonConverter : JsonConverter<DateTime>
{
    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var str = reader.GetString();
        if (string.IsNullOrWhiteSpace(str))
            return DateTime.Today.AddDays(1);

        if (DateTime.TryParse(str, null, System.Globalization.DateTimeStyles.RoundtripKind, out var dt))
            return dt;
        if (DateTime.TryParse(str, out dt))
            return dt;

        return DateTime.Today.AddDays(1);
    }

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString("yyyy-MM-dd"));
    }
}
