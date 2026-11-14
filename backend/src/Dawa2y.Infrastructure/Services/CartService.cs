using Microsoft.EntityFrameworkCore;
using Dawa2y.Application.DTOs;
using Dawa2y.Application.Interfaces;
using Dawa2y.Domain.Entities;
using Dawa2y.Infrastructure.Persistence;

namespace Dawa2y.Infrastructure.Services;

public class CartService : ICartService
{
    private readonly Dawa2yDbContext _context;

    public CartService(Dawa2yDbContext context)
    {
        _context = context;
    }

    public async Task<CartDto> GetCartAsync(Guid? userId, string? guestSessionId, CancellationToken cancellationToken = default)
    {
        var cart = await GetOrCreateCartAsync(userId, guestSessionId, cancellationToken);
        return MapToCartDto(cart);
    }

    public async Task<CartDto> AddItemAsync(Guid? userId, AddToCartDto dto, CancellationToken cancellationToken = default)
    {
        var product = await _context.Products.FindAsync([dto.ProductId], cancellationToken);
        if (product == null || !product.IsActive)
        {
            throw new KeyNotFoundException("Product not found or inactive.");
        }

        var cart = await GetOrCreateCartAsync(userId, dto.GuestSessionId, cancellationToken);

        var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == dto.ProductId);
        var requestedQuantity = (existingItem?.Quantity ?? 0) + Math.Max(1, dto.Quantity);

        if (requestedQuantity > product.TotalStock)
        {
            throw new InvalidOperationException($"Only {product.TotalStock} units available in stock.");
        }

        var unitPrice = product.DiscountPrice ?? product.Price;

        if (existingItem != null)
        {
            existingItem.Quantity = requestedQuantity;
            existingItem.UnitPrice = unitPrice;
            existingItem.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            var newItem = new CartItem
            {
                Id = Guid.NewGuid(),
                CartId = cart.Id,
                ProductId = product.Id,
                Quantity = Math.Max(1, dto.Quantity),
                UnitPrice = unitPrice,
                CreatedAt = DateTime.UtcNow
            };
            _context.CartItems.Add(newItem);
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        // Reload to include product navigation properties
        return await GetCartAsync(userId, dto.GuestSessionId, cancellationToken);
    }

    public async Task<CartDto> UpdateItemQuantityAsync(Guid? userId, string? guestSessionId, UpdateCartItemDto dto, CancellationToken cancellationToken = default)
    {
        var cart = await GetOrCreateCartAsync(userId, guestSessionId, cancellationToken);
        var item = cart.Items.FirstOrDefault(i => i.Id == dto.CartItemId);
        if (item == null)
        {
            throw new KeyNotFoundException("Cart item not found.");
        }

        if (dto.Quantity <= 0)
        {
            cart.Items.Remove(item);
            _context.CartItems.Remove(item);
        }
        else
        {
            var product = await _context.Products.FindAsync([item.ProductId], cancellationToken);
            if (product != null && dto.Quantity > product.TotalStock)
            {
                throw new InvalidOperationException($"Cannot request more than {product.TotalStock} units.");
            }
            item.Quantity = dto.Quantity;
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return await GetCartAsync(userId, guestSessionId, cancellationToken);
    }

    public async Task<CartDto> RemoveItemAsync(Guid? userId, string? guestSessionId, Guid cartItemId, CancellationToken cancellationToken = default)
    {
        var cart = await GetOrCreateCartAsync(userId, guestSessionId, cancellationToken);
        var item = cart.Items.FirstOrDefault(i => i.Id == cartItemId);
        if (item != null)
        {
            cart.Items.Remove(item);
            _context.CartItems.Remove(item);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return await GetCartAsync(userId, guestSessionId, cancellationToken);
    }

    public async Task ClearCartAsync(Guid? userId, string? guestSessionId, CancellationToken cancellationToken = default)
    {
        var cart = await GetOrCreateCartAsync(userId, guestSessionId, cancellationToken);
        _context.CartItems.RemoveRange(cart.Items);
        cart.Items.Clear();
        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task<Cart> GetOrCreateCartAsync(Guid? userId, string? guestSessionId, CancellationToken cancellationToken)
    {
        Cart? cart = null;

        if (userId.HasValue)
        {
            cart = await _context.Carts
                .Include(c => c.Items)
                .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId.Value, cancellationToken);

            if (cart == null)
            {
                cart = new Cart { UserId = userId.Value, CreatedAt = DateTime.UtcNow };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync(cancellationToken);
            }
        }
        else if (!string.IsNullOrWhiteSpace(guestSessionId))
        {
            cart = await _context.Carts
                .Include(c => c.Items)
                .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(c => c.GuestSessionId == guestSessionId, cancellationToken);

            if (cart == null)
            {
                cart = new Cart { GuestSessionId = guestSessionId, CreatedAt = DateTime.UtcNow };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync(cancellationToken);
            }
        }
        else
        {
            cart = new Cart { GuestSessionId = Guid.NewGuid().ToString("N"), CreatedAt = DateTime.UtcNow };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return cart;
    }

    private static CartDto MapToCartDto(Cart cart)
    {
        var items = cart.Items.Select(i => new CartItemDto(
            i.Id,
            i.ProductId,
            i.Product?.NameAr ?? "منتج",
            i.Product?.NameEn ?? "Product",
            i.Product?.ImageUrl ?? "",
            i.UnitPrice,
            i.Quantity,
            i.UnitPrice * i.Quantity,
            i.Product?.TotalStock ?? 0
        )).ToList();

        var subtotal = items.Sum(i => i.TotalPrice);
        var deliveryFee = items.Count > 0 ? 25.00m : 0.00m; // 25 EGP flat shipping across Egypt
        var total = subtotal + deliveryFee;

        return new CartDto(cart.Id, items, subtotal, deliveryFee, total);
    }
}

