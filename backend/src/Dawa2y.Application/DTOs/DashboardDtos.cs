using Dawa2y.Domain.Enums;

namespace Dawa2y.Application.DTOs;

public record BranchDto(
    Guid Id,
    string NameAr,
    string NameEn,
    EgyptianGovernorate Governorate,
    string GovernorateName,
    string AddressAr,
    string AddressEn,
    string PhoneNumber,
    string WorkingHours,
    double Latitude,
    double Longitude,
    bool IsMainBranch);

public record BranchInventoryDto(
    Guid Id,
    Guid BranchId,
    string BranchNameEn,
    string BranchNameAr,
    Guid ProductId,
    string ProductNameEn,
    string ProductNameAr,
    string Sku,
    int Quantity,
    int ReorderThreshold,
    DateTime LastRestockedAt,
    bool IsLowStock);

public record AdjustStockDto(
    Guid BranchId,
    Guid ProductId,
    int NewQuantity);

public record DashboardOverviewDto(
    int TotalProducts,
    int TotalBranches,
    int TotalOrders,
    decimal TotalRevenue,
    int LowStockItemCount,
    int TodayVisitors,
    decimal TodayRevenue,
    int TodayOrders,
    IReadOnlyList<SalesChartPointDto> WeeklySalesTrend,
    IReadOnlyList<TopProductDto> TopSellingProducts,
    IReadOnlyList<BranchInsightDto> BranchInsights,
    IReadOnlyList<VisitorTrendDto> VisitorTrends);

public record SalesChartPointDto(
    string Date,
    decimal Revenue,
    int OrdersCount);

public record TopProductDto(
    Guid ProductId,
    string NameEn,
    string NameAr,
    string Category,
    int UnitsSold,
    decimal RevenueGenerated);

public record BranchInsightDto(
    Guid BranchId,
    string BranchName,
    string Governorate,
    int OrdersFulfilled,
    decimal Revenue,
    int InventoryCount);

public record VisitorTrendDto(
    string Date,
    int VisitorsCount,
    int OrdersCount,
    decimal ConversionRate);

