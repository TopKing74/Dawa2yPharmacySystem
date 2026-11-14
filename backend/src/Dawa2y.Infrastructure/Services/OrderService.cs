using Microsoft.EntityFrameworkCore;
using Dawa2y.Application.DTOs;
using Dawa2y.Application.Interfaces;
using Dawa2y.Domain.Entities;
using Dawa2y.Domain.Enums;
using Dawa2y.Infrastructure.Persistence;

namespace Dawa2y.Infrastructure.Services;

public class OrderService : IOrderService
{
    private readonly Dawa2yDbContext _context;
    private readonly ICartService _cartService;
    private readonly IPaymentService _paymentService;

    public OrderService(Dawa2yDbContext context, ICartService cartService, IPaymentService paymentService)
    {
        _context = context;
        _cartService = cartService;
        _paymentService = paymentService;
    }

    public async Task<OrderDto> CreateOrderAsync(Guid? userId, CheckoutRequestDto request, CancellationToken cancellationToken = default)
    {
        // 1. Fetch current cart
        var cart = await _context.Carts
            .Include(c => c.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c =>
                (userId.HasValue && c.UserId == userId.Value) ||
                (!string.IsNullOrWhiteSpace(request.GuestSessionId) && c.GuestSessionId == request.GuestSessionId),
                cancellationToken);

        if (cart == null || cart.Items.Count == 0)
        {
            throw new InvalidOperationException("Cannot checkout an empty shopping cart.");
        }

        // 2. Validate stock availability for all items
        foreach (var item in cart.Items)
        {
            if (item.Product.TotalStock < item.Quantity)
            {
                throw new InvalidOperationException($"Insufficient stock for {item.Product.NameEn} ({item.Product.NameAr}). Available: {item.Product.TotalStock}.");
            }
        }

        // 3. Select fulfillment branch (prioritize requested branch, or match Governorate, or fall back to main branch)
        Branch? fulfillmentBranch = null;
        if (request.PreferredBranchId.HasValue)
        {
            fulfillmentBranch = await _context.Branches.FindAsync([request.PreferredBranchId.Value], cancellationToken);
        }

        if (fulfillmentBranch == null)
        {
            fulfillmentBranch = await _context.Branches
                .FirstOrDefaultAsync(b => b.Governorate == request.Governorate, cancellationToken)
                ?? await _context.Branches.FirstOrDefaultAsync(b => b.IsMainBranch, cancellationToken)
                ?? await _context.Branches.FirstOrDefaultAsync(cancellationToken);
        }

        // 4. Calculate amounts
        var subtotal = cart.Items.Sum(i => i.UnitPrice * i.Quantity);
        var deliveryFee = 25.00m; // 25 EGP flat Egyptian delivery
        var totalAmount = subtotal + deliveryFee;

        // 5. Generate Order Number
        var orderNumber = $"DW-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(10000, 99999)}";

        // 6. Handle Payment
        PaymentStatus initialPaymentStatus = PaymentStatus.Pending;
        string? cardBrand = null;
        string? cardLastFour = null;
        string? transactionId = null;

        if (request.PaymentMethod == PaymentMethod.Visa)
        {
            if (request.CardDetails == null)
            {
                throw new ArgumentException("Card payment details are required for Visa checkout.");
            }

            var paymentResult = await _paymentService.ProcessCardPaymentAsync(
                totalAmount,
                request.CardDetails,
                orderNumber,
                cancellationToken);

            if (!paymentResult.Success)
            {
                throw new InvalidOperationException($"Card payment declined: {paymentResult.Message}");
            }

            initialPaymentStatus = PaymentStatus.Paid;
            cardBrand = paymentResult.CardBrand;
            cardLastFour = paymentResult.LastFour;
            transactionId = paymentResult.TransactionId;
        }
        else
        {
            // Cash on door
            initialPaymentStatus = PaymentStatus.Pending;
        }

        // 7. Create Order Entity
        var order = new Order
        {
            OrderNumber = orderNumber,
            UserId = userId,
            FulfillmentBranchId = fulfillmentBranch?.Id,
            CustomerName = request.CustomerName.Trim(),
            CustomerEmail = request.CustomerEmail.Trim(),
            CustomerPhone = request.CustomerPhone.Trim(),
            Governorate = request.Governorate,
            ShippingAddress = request.ShippingAddress.Trim(),
            Notes = request.Notes?.Trim(),
            Status = initialPaymentStatus == PaymentStatus.Paid ? OrderStatus.Confirmed : OrderStatus.Pending,
            PaymentMethod = request.PaymentMethod,
            PaymentStatus = initialPaymentStatus,
            Subtotal = subtotal,
            DeliveryFee = deliveryFee,
            TotalAmount = totalAmount,
            CreatedAt = DateTime.UtcNow
        };

        // 8. Populate Order Items and deduct inventory atomically
        foreach (var cartItem in cart.Items)
        {
            var orderItem = new OrderItem
            {
                OrderId = order.Id,
                ProductId = cartItem.ProductId,
                ProductNameAr = cartItem.Product.NameAr,
                ProductNameEn = cartItem.Product.NameEn,
                UnitPrice = cartItem.UnitPrice,
                Quantity = cartItem.Quantity,
                TotalPrice = cartItem.UnitPrice * cartItem.Quantity
            };
            order.Items.Add(orderItem);

            // Deduct product overall stock
            cartItem.Product.TotalStock -= cartItem.Quantity;

            // Deduct branch inventory if exists
            if (fulfillmentBranch != null)
            {
                var branchInv = await _context.BranchInventories
                    .FirstOrDefaultAsync(bi => bi.BranchId == fulfillmentBranch.Id && bi.ProductId == cartItem.ProductId, cancellationToken);
                if (branchInv != null)
                {
                    branchInv.Quantity = Math.Max(0, branchInv.Quantity - cartItem.Quantity);
                }
            }
        }

        // 9. Attach Payment entity if Visa
        if (request.PaymentMethod == PaymentMethod.Visa && !string.IsNullOrWhiteSpace(transactionId))
        {
            order.Payment = new Payment
            {
                OrderId = order.Id,
                Method = PaymentMethod.Visa,
                Status = PaymentStatus.Paid,
                Amount = totalAmount,
                Currency = "EGP",
                TransactionId = transactionId,
                CardBrand = cardBrand,
                CardLastFour = cardLastFour,
                ProcessedAt = DateTime.UtcNow,
                GatewayResponse = "Approved - Authorization verified"
            };
        }

        _context.Orders.Add(order);

        // 10. Clear cart items
        _context.CartItems.RemoveRange(cart.Items);

        await _context.SaveChangesAsync(cancellationToken);

        return MapToOrderDto(order);
    }

    public async Task<OrderDto?> GetOrderByIdAsync(Guid orderId, Guid? requestingUserId, bool isAdmin = false, CancellationToken cancellationToken = default)
    {
        var query = _context.Orders
            .Include(o => o.Items)
            .Include(o => o.Payment)
            .Include(o => o.FulfillmentBranch)
            .AsNoTracking();

        if (!isAdmin && requestingUserId.HasValue)
        {
            query = query.Where(o => o.UserId == requestingUserId.Value);
        }

        var order = await query.FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);
        return order == null ? null : MapToOrderDto(order);
    }

    public async Task<OrderDto?> GetOrderByNumberAsync(string orderNumber, CancellationToken cancellationToken = default)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .Include(o => o.Payment)
            .Include(o => o.FulfillmentBranch)
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber.Trim(), cancellationToken);

        return order == null ? null : MapToOrderDto(order);
    }

    public async Task<PagedResult<OrderDto>> GetUserOrdersAsync(Guid userId, int page = 1, int pageSize = 10, CancellationToken cancellationToken = default)
    {
        var query = _context.Orders
            .Include(o => o.Items)
            .Include(o => o.Payment)
            .Include(o => o.FulfillmentBranch)
            .AsNoTracking()
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt);

        var total = await query.CountAsync(cancellationToken);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

        return new PagedResult<OrderDto>(
            items.Select(MapToOrderDto).ToList(),
            total,
            page,
            pageSize,
            (int)Math.Ceiling(total / (double)pageSize));
    }

    public async Task<PagedResult<OrderDto>> GetAllOrdersAsync(int page = 1, int pageSize = 20, OrderStatus? status = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Orders
            .Include(o => o.Items)
            .Include(o => o.Payment)
            .Include(o => o.FulfillmentBranch)
            .AsNoTracking();

        if (status.HasValue)
        {
            query = query.Where(o => o.Status == status.Value);
        }

        query = query.OrderByDescending(o => o.CreatedAt);

        var total = await query.CountAsync(cancellationToken);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

        return new PagedResult<OrderDto>(
            items.Select(MapToOrderDto).ToList(),
            total,
            page,
            pageSize,
            (int)Math.Ceiling(total / (double)pageSize));
    }

    public async Task<OrderDto> UpdateOrderStatusAsync(Guid orderId, OrderStatusUpdateDto dto, CancellationToken cancellationToken = default)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .Include(o => o.Payment)
            .Include(o => o.FulfillmentBranch)
            .FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);

        if (order == null)
        {
            throw new KeyNotFoundException($"Order {orderId} not found.");
        }

        order.Status = dto.Status;
        if (dto.PaymentStatus.HasValue)
        {
            order.PaymentStatus = dto.PaymentStatus.Value;
        }

        if (dto.Status == OrderStatus.Delivered && order.PaymentMethod == PaymentMethod.CashOnDelivery)
        {
            order.PaymentStatus = PaymentStatus.Paid;
        }

        order.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return MapToOrderDto(order);
    }

    private static OrderDto MapToOrderDto(Order o) => new(
        o.Id,
        o.OrderNumber,
        o.CreatedAt,
        o.CustomerName,
        o.CustomerEmail,
        o.CustomerPhone,
        o.Governorate,
        o.ShippingAddress,
        o.Notes,
        o.Status,
        o.PaymentMethod,
        o.PaymentStatus,
        o.Subtotal,
        o.DeliveryFee,
        o.TotalAmount,
        o.FulfillmentBranch?.NameEn,
        o.Payment?.CardLastFour,
        o.Items.Select(i => new OrderItemDto(
            i.Id,
            i.ProductId,
            i.ProductNameAr,
            i.ProductNameEn,
            i.UnitPrice,
            i.Quantity,
            i.TotalPrice
        )).ToList()
    );
}

