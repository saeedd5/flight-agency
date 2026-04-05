namespace FlightSearch.API.Infrastructure.Identity;

/// <summary>
/// Service for hashing passwords with BCrypt
/// </summary>
public class PasswordHasher
{
    /// <summary>
    /// Hash password
    /// </summary>
    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password, BCrypt.Net.BCrypt.GenerateSalt(11));
    }

    /// <summary>
    /// Verify password
    /// </summary>
    public bool VerifyPassword(string password, string passwordHash)
    {
        try
        {
            return BCrypt.Net.BCrypt.Verify(password, passwordHash);
        }
        catch
        {
            return false;
        }
    }
}

