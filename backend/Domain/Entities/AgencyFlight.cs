namespace FlightSearch.API.Domain.Entities;

public class AgencyFlight
{
    public int Id { get; set; }
    public int AgencyId { get; set; } // آیدی کاربری که نقش آژانس دارد
    
    // اطلاعات اصلی پرواز که ذخیره می‌کنیم
    public string FlightKey { get; set; } = string.Empty;
    public string Airline { get; set; } = string.Empty;
    public string FlightNumber { get; set; } = string.Empty;
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public DateTime DepartureTime { get; set; }
    
    // اطلاعات قیمت‌گذاری
    public decimal BasePrice { get; set; }     // قیمت اصلی
    public decimal MarkupPercentage { get; set; } // درصد سود آژانس
    public decimal FinalPrice { get; set; }    // قیمت نهایی (محاسبه شده)
    public string Currency { get; set; } = "USD";
    public string RawFlightData { get; set; } = string.Empty; // کل اطلاعات پرواز اینجا ذخیره میشود

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // ارتباط با جدول User
    public virtual User? Agency { get; set; }
}