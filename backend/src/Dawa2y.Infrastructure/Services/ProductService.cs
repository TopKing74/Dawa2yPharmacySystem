using Microsoft.EntityFrameworkCore;
using Dawa2y.Application.DTOs;
using Dawa2y.Application.Interfaces;
using Dawa2y.Domain.Entities;
using Dawa2y.Infrastructure.Persistence;

namespace Dawa2y.Infrastructure.Services;

public class ProductService : IProductService
{
    private readonly Dawa2yDbContext _context;

    public ProductService(Dawa2yDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<ProductDto>> GetProductsAsync(ProductFilterDto filter, CancellationToken cancellationToken = default)
    {
        var query = _context.Products.AsNoTracking().Where(p => p.IsActive);

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var term = filter.SearchTerm.Trim().ToLower();
            query = query.Where(p =>
                p.NameEn.ToLower().Contains(term) ||
                p.NameAr.ToLower().Contains(term) ||
                p.ActiveIngredient.ToLower().Contains(term) ||
                p.Manufacturer.ToLower().Contains(term) ||
                p.Sku.ToLower().Contains(term));
        }

        if (filter.Category.HasValue)
        {
            query = query.Where(p => p.Category == filter.Category.Value);
        }

        if (filter.MinPrice.HasValue)
        {
            query = query.Where(p => p.Price >= filter.MinPrice.Value);
        }

        if (filter.MaxPrice.HasValue)
        {
            query = query.Where(p => p.Price <= filter.MaxPrice.Value);
        }

        if (filter.RequiresPrescription.HasValue)
        {
            query = query.Where(p => p.RequiresPrescription == filter.RequiresPrescription.Value);
        }

        if (filter.InStockOnly == true)
        {
            query = query.Where(p => p.TotalStock > 0);
        }

        query = (filter.SortBy?.ToLower(), filter.SortDescending) switch
        {
            ("price", false) => query.OrderBy(p => p.Price),
            ("price", true) => query.OrderByDescending(p => p.Price),
            ("stock", false) => query.OrderBy(p => p.TotalStock),
            ("stock", true) => query.OrderByDescending(p => p.TotalStock),
            ("date", false) => query.OrderBy(p => p.CreatedAt),
            ("date", true) => query.OrderByDescending(p => p.CreatedAt),
            _ => filter.SortDescending ? query.OrderByDescending(p => p.NameEn) : query.OrderBy(p => p.NameEn)
        };

        var totalCount = await query.CountAsync(cancellationToken);
        var page = Math.Max(1, filter.PageNumber);
        var pageSize = Math.Clamp(filter.PageSize, 1, 100);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => MapToDto(p))
            .ToListAsync(cancellationToken);

        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        return new PagedResult<ProductDto>(items, totalCount, page, pageSize, totalPages);
    }

    public async Task<ProductDto?> GetProductByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await _context.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        return product == null ? null : MapToDto(product);
    }

    public async Task<ProductDto> CreateProductAsync(CreateProductDto dto, CancellationToken cancellationToken = default)
    {
        var product = new Product
        {
            NameAr = dto.NameAr.Trim(),
            NameEn = dto.NameEn.Trim(),
            DescriptionAr = dto.DescriptionAr.Trim(),
            DescriptionEn = dto.DescriptionEn.Trim(),
            Sku = dto.Sku.Trim().ToUpperInvariant(),
            Category = dto.Category,
            Price = dto.Price,
            DiscountPrice = dto.DiscountPrice,
            ImageUrl = string.IsNullOrWhiteSpace(dto.ImageUrl) ? "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500" : dto.ImageUrl.Trim(),
            RequiresPrescription = dto.RequiresPrescription,
            Dosage = dto.Dosage.Trim(),
            ActiveIngredient = dto.ActiveIngredient.Trim(),
            Manufacturer = dto.Manufacturer.Trim(),
            TotalStock = dto.InitialStock,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync(cancellationToken);

        // Distribute initial stock equally across branches
        var branches = await _context.Branches.ToListAsync(cancellationToken);
        if (branches.Count > 0 && dto.InitialStock > 0)
        {
            var perBranchStock = Math.Max(1, dto.InitialStock / branches.Count);
            foreach (var b in branches)
            {
                _context.BranchInventories.Add(new BranchInventory
                {
                    BranchId = b.Id,
                    ProductId = product.Id,
                    Quantity = perBranchStock,
                    ReorderThreshold = 10,
                    LastRestockedAt = DateTime.UtcNow
                });
            }
            await _context.SaveChangesAsync(cancellationToken);
        }

        return MapToDto(product);
    }

    public async Task<ProductDto> UpdateProductAsync(Guid id, UpdateProductDto dto, CancellationToken cancellationToken = default)
    {
        var product = await _context.Products.FindAsync([id], cancellationToken);
        if (product == null)
        {
            throw new KeyNotFoundException($"Product with ID {id} not found.");
        }

        product.NameAr = dto.NameAr.Trim();
        product.NameEn = dto.NameEn.Trim();
        product.DescriptionAr = dto.DescriptionAr.Trim();
        product.DescriptionEn = dto.DescriptionEn.Trim();
        product.Sku = dto.Sku.Trim().ToUpperInvariant();
        product.Category = dto.Category;
        product.Price = dto.Price;
        product.DiscountPrice = dto.DiscountPrice;
        if (!string.IsNullOrWhiteSpace(dto.ImageUrl)) product.ImageUrl = dto.ImageUrl.Trim();
        product.RequiresPrescription = dto.RequiresPrescription;
        product.Dosage = dto.Dosage.Trim();
        product.ActiveIngredient = dto.ActiveIngredient.Trim();
        product.Manufacturer = dto.Manufacturer.Trim();
        product.TotalStock = dto.TotalStock;
        product.IsActive = dto.IsActive;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return MapToDto(product);
    }

    public async Task<bool> DeleteProductAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await _context.Products.FindAsync([id], cancellationToken);
        if (product == null) return false;

        // Soft delete to protect referential integrity of past order history
        product.IsActive = false;
        product.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<IReadOnlyList<ProductDto>> GetFeaturedProductsAsync(CancellationToken cancellationToken = default)
    {
        var products = await _context.Products.AsNoTracking()
            .Where(p => p.IsActive && p.TotalStock > 0)
            .OrderByDescending(p => p.DiscountPrice.HasValue)
            .ThenByDescending(p => p.CreatedAt)
            .Take(8)
            .Select(p => MapToDto(p))
            .ToListAsync(cancellationToken);

        return products;
    }

    private static ProductDto MapToDto(Product p) => new(
        p.Id,
        p.NameAr,
        p.NameEn,
        p.DescriptionAr,
        p.DescriptionEn,
        p.Sku,
        p.Category,
        p.Category.ToString(),
        p.Price,
        p.DiscountPrice,
        p.ImageUrl,
        p.RequiresPrescription,
        p.Dosage,
        p.ActiveIngredient,
        p.Manufacturer,
        p.TotalStock,
        p.IsActive);
}

