using System.Text.RegularExpressions;
using Dawa2y.Application.DTOs;
using Dawa2y.Application.Interfaces;

namespace Dawa2y.Infrastructure.Services;

public class VisaPaymentGatewayService : IPaymentService
{
    public async Task<(bool Success, string TransactionId, string Message, string? CardBrand, string? LastFour)> ProcessCardPaymentAsync(
        decimal amount,
        CardPaymentDetailsDto cardDetails,
        string orderNumber,
        CancellationToken cancellationToken = default)
    {
        // Simulate real-world payment gateway latency (e.g. Paymob / Visa CyberSource / Stripe)
        await Task.Delay(250, cancellationToken);

        if (amount <= 0)
        {
            return (false, string.Empty, "Invalid payment amount.", null, null);
        }

        var cleanNumber = Regex.Replace(cardDetails.CardNumber ?? string.Empty, @"[\s-]", "");
        if (string.IsNullOrWhiteSpace(cleanNumber) || cleanNumber.Length < 13 || cleanNumber.Length > 19)
        {
            return (false, string.Empty, "Invalid card number length.", null, null);
        }

        // Validate Luhn Checksum
        if (!IsValidLuhn(cleanNumber))
        {
            return (false, string.Empty, "Card number failed Luhn checksum validation.", null, null);
        }

        // Validate Expiration
        if (!int.TryParse(cardDetails.ExpirationMonth, out var month) || month < 1 || month > 12)
        {
            return (false, string.Empty, "Invalid card expiration month.", null, null);
        }

        if (!int.TryParse(cardDetails.ExpirationYear, out var year))
        {
            return (false, string.Empty, "Invalid card expiration year.", null, null);
        }

        var expiry = new DateTime(year, month, 1).AddMonths(1).AddDays(-1);
        if (expiry < DateTime.UtcNow.Date)
        {
            return (false, string.Empty, "Card has expired.", null, null);
        }

        // Validate CVV
        if (string.IsNullOrWhiteSpace(cardDetails.Cvv) || cardDetails.Cvv.Length < 3 || cardDetails.Cvv.Length > 4 || !cardDetails.Cvv.All(char.IsDigit))
        {
            return (false, string.Empty, "Invalid card security code (CVV).", null, null);
        }

        // Detect Brand
        string brand = "Visa";
        if (cleanNumber.StartsWith("4"))
        {
            brand = "Visa";
        }
        else if (cleanNumber.StartsWith("51") || cleanNumber.StartsWith("52") || cleanNumber.StartsWith("53") ||
                 cleanNumber.StartsWith("54") || cleanNumber.StartsWith("55") || cleanNumber.StartsWith("2"))
        {
            brand = "Mastercard";
        }
        else if (cleanNumber.StartsWith("5078") || cleanNumber.StartsWith("5048") || cleanNumber.StartsWith("6709"))
        {
            brand = "Meeza (Egypt National Scheme)";
        }

        var lastFour = cleanNumber[^4..];
        var transactionId = $"TXN-EG-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";

        return (true, transactionId, $"Payment of {amount:F2} EGP authorized successfully via {brand}.", brand, lastFour);
    }

    private static bool IsValidLuhn(string number)
    {
        int sum = 0;
        bool alternate = false;
        for (int i = number.Length - 1; i >= 0; i--)
        {
            int n = int.Parse(number[i].ToString());
            if (alternate)
            {
                n *= 2;
                if (n > 9) n -= 9;
            }
            sum += n;
            alternate = !alternate;
        }
        return (sum % 10 == 0);
    }
}

