using Dawa2y.Domain.Enums;

namespace Dawa2y.Application.DTOs;

public record CartItemDto(
    Guid Id,
    Guid ProductId,
    string ProductNameAr,
    string ProductNameEn,
    string ImageUrl,
    decimal UnitPrice,
    int Quantity,
    decimal TotalPrice,
    int AvailableStock);

public record CartDto(
    Guid Id,
    IReadOnlyList<CartItemDto> Items,
    decimal Subtotal,
    decimal DeliveryFee,
    decimal Total);

public record AddToCartDto(
    Guid ProductId,
    int Quantity = 1,
    string? GuestSessionId = null);

public record UpdateCartItemDto(
    Guid CartItemId,
    int Quantity);

public record CardPaymentDetailsDto(
    string CardNumber,
    string CardHolderName,
    string ExpirationMonth,
    string ExpirationYear,
    string Cvv);

public record CheckoutRequestDto(
    string CustomerName,
    string CustomerEmail,
    string CustomerPhone,
    EgyptianGovernorate Governorate,
    string ShippingAddress,
    PaymentMethod PaymentMethod,
    Guid? PreferredBranchId,
    string? Notes,
    string? GuestSessionId,
    CardPaymentDetailsDto? CardDetails);

public record OrderItemDto(
    Guid Id,
    Guid ProductId,
    string ProductNameAr,
    string ProductNameEn,
    decimal UnitPrice,
    int Quantity,
    decimal TotalPrice);

public record OrderDto(
    Guid Id,
    string OrderNumber,
    DateTime CreatedAt,
    string CustomerName,
    string CustomerEmail,
    string CustomerPhone,
    EgyptianGovernorate Governorate,
    string ShippingAddress,
    string? Notes,
    OrderStatus Status,
    PaymentMethod PaymentMethod,
    PaymentStatus PaymentStatus,
    decimal Subtotal,
    decimal DeliveryFee,
    decimal TotalAmount,
    string? FulfillmentBranchName,
    string? CardLastFour,
    IReadOnlyList<OrderItemDto> Items);

public record OrderStatusUpdateDto(
    OrderStatus Status,
    PaymentStatus? PaymentStatus = null);

