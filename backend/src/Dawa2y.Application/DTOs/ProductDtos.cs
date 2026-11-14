using Dawa2y.Domain.Enums;

namespace Dawa2y.Application.DTOs;

public record ProductDto(
    Guid Id,
    string NameAr,
    string NameEn,
    string DescriptionAr,
    string DescriptionEn,
    string Sku,
    ProductCategory Category,
    string CategoryName,
    decimal Price,
    decimal? DiscountPrice,
    string ImageUrl,
    bool RequiresPrescription,
    string Dosage,
    string ActiveIngredient,
    string Manufacturer,
    int TotalStock,
    bool IsActive);

public record CreateProductDto(
    string NameAr,
    string NameEn,
    string DescriptionAr,
    string DescriptionEn,
    string Sku,
    ProductCategory Category,
    decimal Price,
    decimal? DiscountPrice,
    string ImageUrl,
    bool RequiresPrescription,
    string Dosage,
    string ActiveIngredient,
    string Manufacturer,
    int InitialStock);

public record UpdateProductDto(
    string NameAr,
    string NameEn,
    string DescriptionAr,
    string DescriptionEn,
    string Sku,
    ProductCategory Category,
    decimal Price,
    decimal? DiscountPrice,
    string ImageUrl,
    bool RequiresPrescription,
    string Dosage,
    string ActiveIngredient,
    string Manufacturer,
    int TotalStock,
    bool IsActive);

public record ProductFilterDto(
    string? SearchTerm = null,
    ProductCategory? Category = null,
    decimal? MinPrice = null,
    decimal? MaxPrice = null,
    bool? RequiresPrescription = null,
    bool? InStockOnly = null,
    string? SortBy = "name",
    bool SortDescending = false,
    int PageNumber = 1,
    int PageSize = 12);

public record PagedResult<T>(
    IReadOnlyList<T> Items,
    int TotalCount,
    int PageNumber,
    int PageSize,
    int TotalPages);

