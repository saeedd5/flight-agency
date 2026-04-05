using System.Text.Json;
using System.Text.Json.Serialization;

namespace FlightSearch.API.Application.DTOs;

/// <summary>
/// JSON converter for nullable DateTime - accepts date-only or full ISO strings.
/// </summary>
public class NullableDateJsonConverter : JsonConverter<DateTime?>
{
    public override DateTime? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Null)
            return null;

        var str = reader.GetString();
        if (string.IsNullOrWhiteSpace(str))
            return null;

        if (DateTime.TryParse(str, null, System.Globalization.DateTimeStyles.RoundtripKind, out var dt))
            return dt;
        if (DateTime.TryParse(str, out dt))
            return dt;

        return null;
    }

    public override void Write(Utf8JsonWriter writer, DateTime? value, JsonSerializerOptions options)
    {
        if (value == null)
            writer.WriteNullValue();
        else
            writer.WriteStringValue(value.Value.ToString("yyyy-MM-dd"));
    }
}
