using Microsoft.EntityFrameworkCore;
using Dawa2y.Application.Interfaces;
using Dawa2y.Domain.Entities;
using Dawa2y.Domain.Enums;
using Dawa2y.Infrastructure.Persistence;

namespace Dawa2y.Infrastructure.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(Dawa2yDbContext context, IPasswordHasher passwordHasher)
    {
        await context.Database.EnsureCreatedAsync();

        // 1. Seed Users
        if (!await context.Users.AnyAsync())
        {
            var admin = new User
            {
                FullName = "Dawa2y Chief Administrator",
                Email = "admin@dawa2y.com",
                PasswordHash = passwordHasher.HashPassword("Admin@123456"),
                PhoneNumber = "01001234567",
                Role = UserRole.Admin,
                Governorate = EgyptianGovernorate.Cairo,
                Address = "Dawa2y HQ, Nasr City, Cairo",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var pharmacist = new User
            {
                FullName = "Dr. Ahmed Mansour (Chief Pharmacist)",
                Email = "pharmacist@dawa2y.com",
                PasswordHash = passwordHasher.HashPassword("Pharm@123456"),
                PhoneNumber = "01123456789",
                Role = UserRole.Pharmacist,
                Governorate = EgyptianGovernorate.Giza,
                Address = "Mohandessin Branch, Giza",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var customer = new User
            {
                FullName = "Karim Mahmoud",
                Email = "customer@dawa2y.com",
                PasswordHash = passwordHasher.HashPassword("Customer@123456"),
                PhoneNumber = "01234567890",
                Role = UserRole.Customer,
                Governorate = EgyptianGovernorate.Cairo,
                Address = "24 Degla St, Maadi, Cairo",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            context.Users.AddRange(admin, pharmacist, customer);
            await context.SaveChangesAsync();
        }

        // 2. Seed 30 Branches across Egyptian Governorates
        if (!await context.Branches.AnyAsync())
        {
            var branches = new List<Branch>
            {
                // Cairo (6 branches)
                new() { NameEn = "Dawa2y Nasr City (Main HQ)", NameAr = "دوائي مدينة نصر (الفرع الرئيسي)", Governorate = EgyptianGovernorate.Cairo, AddressEn = "Abbas El Akkad St, Nasr City", AddressAr = "شارع عباس العقاد، مدينة نصر", PhoneNumber = "0222718901", WorkingHours = "24/7", Latitude = 30.0561, Longitude = 31.3435, IsMainBranch = true },
                new() { NameEn = "Dawa2y Maadi Branch", NameAr = "دوائي المعادي", Governorate = EgyptianGovernorate.Cairo, AddressEn = "9th Road, Degla, Maadi", AddressAr = "شارع 9، دجلة، المعادي", PhoneNumber = "0223589012", WorkingHours = "24/7", Latitude = 29.9599, Longitude = 31.2585 },
                new() { NameEn = "Dawa2y Heliopolis Branch", NameAr = "دوائي مصر الجديدة", Governorate = EgyptianGovernorate.Cairo, AddressEn = "Al Ahram St, Korba, Heliopolis", AddressAr = "شارع الأهرام، الكوربة، مصر الجديدة", PhoneNumber = "0224156789", WorkingHours = "24/7", Latitude = 30.0898, Longitude = 31.3285 },
                new() { NameEn = "Dawa2y New Cairo Branch", NameAr = "دوائي التجمع الخامس", Governorate = EgyptianGovernorate.Cairo, AddressEn = "North 90th St, New Cairo", AddressAr = "شارع التسعين الشمالي، التجمع الخامس", PhoneNumber = "0228123456", WorkingHours = "24/7", Latitude = 30.0270, Longitude = 31.4740 },
                new() { NameEn = "Dawa2y Downtown Branch", NameAr = "دوائي وسط البلد", Governorate = EgyptianGovernorate.Cairo, AddressEn = "Talaat Harb St, Downtown", AddressAr = "شارع طلعت حرب، وسط البلد", PhoneNumber = "0223924567", WorkingHours = "24/7", Latitude = 30.0488, Longitude = 31.2394 },
                new() { NameEn = "Dawa2y Shubra Branch", NameAr = "دوائي شبرا", Governorate = EgyptianGovernorate.Cairo, AddressEn = "Shubra Main St, Shubra", AddressAr = "شارع شبرا الرئيسي، شبرا", PhoneNumber = "0224318901", WorkingHours = "24/7", Latitude = 30.0768, Longitude = 31.2464 },

                // Giza (5 branches)
                new() { NameEn = "Dawa2y Mohandessin Branch", NameAr = "دوائي المهندسين", Governorate = EgyptianGovernorate.Giza, AddressEn = "Gamiat El Dewal El Arabia St", AddressAr = "شارع جامعة الدول العربية، المهندسين", PhoneNumber = "0237612345", WorkingHours = "24/7", Latitude = 30.0531, Longitude = 31.2001 },
                new() { NameEn = "Dawa2y Dokki Branch", NameAr = "دوائي الدقي", Governorate = EgyptianGovernorate.Giza, AddressEn = "Mesaha Square, Dokki", AddressAr = "ميدان المساحة، الدقي", PhoneNumber = "0237498901", WorkingHours = "24/7", Latitude = 30.0384, Longitude = 31.2125 },
                new() { NameEn = "Dawa2y 6th of October Branch", NameAr = "دوائي 6 أكتوبر", Governorate = EgyptianGovernorate.Giza, AddressEn = "Al Mehwar Al Markazi, 6th of October", AddressAr = "المحور المركزي، مدينة 6 أكتوبر", PhoneNumber = "0238356789", WorkingHours = "24/7", Latitude = 29.9737, Longitude = 30.9529 },
                new() { NameEn = "Dawa2y Sheikh Zayed Branch", NameAr = "دوائي الشيخ زايد", Governorate = EgyptianGovernorate.Giza, AddressEn = "Arkan Plaza, Sheikh Zayed", AddressAr = "أركان بلازا، الشيخ زايد", PhoneNumber = "0238514567", WorkingHours = "24/7", Latitude = 30.0210, Longitude = 30.9980 },
                new() { NameEn = "Dawa2y Haram Branch", NameAr = "دوائي الهرم", Governorate = EgyptianGovernorate.Giza, AddressEn = "Al Haram St, Giza", AddressAr = "شارع الهرم، الجيزة", PhoneNumber = "0235841234", WorkingHours = "24/7", Latitude = 29.9972, Longitude = 31.1718 },

                // Alexandria (4 branches)
                new() { NameEn = "Dawa2y Smouha Branch", NameAr = "دوائي سموحة الإسكندرية", Governorate = EgyptianGovernorate.Alexandria, AddressEn = "Victor Emmanuel Square, Smouha", AddressAr = "ميدان فيكتور عمانويل، سموحة، الإسكندرية", PhoneNumber = "034256789", WorkingHours = "24/7", Latitude = 31.2156, Longitude = 29.9553 },
                new() { NameEn = "Dawa2y Sidi Gaber Branch", NameAr = "دوائي سيدي جابر", Governorate = EgyptianGovernorate.Alexandria, AddressEn = "Horreya Avenue, Sidi Gaber", AddressAr = "طريق الحرية، سيدي جابر", PhoneNumber = "035467890", WorkingHours = "24/7", Latitude = 31.2208, Longitude = 29.9416 },
                new() { NameEn = "Dawa2y Montaza Branch", NameAr = "دوائي المنتزه", Governorate = EgyptianGovernorate.Alexandria, AddressEn = "Corniche St, Montaza", AddressAr = "طريق الكورنيش، المنتزه، الإسكندرية", PhoneNumber = "035541234", WorkingHours = "24/7", Latitude = 31.2829, Longitude = 30.0152 },
                new() { NameEn = "Dawa2y Mansheya Branch", NameAr = "دوائي المنشية", Governorate = EgyptianGovernorate.Alexandria, AddressEn = "Al Tahrir Square, Mansheya", AddressAr = "ميدان التحرير، المنشية", PhoneNumber = "034823456", WorkingHours = "24/7", Latitude = 31.1989, Longitude = 29.8973 },

                // Delta & Canal (7 branches)
                new() { NameEn = "Dawa2y Mansoura Branch", NameAr = "دوائي المنصورة", Governorate = EgyptianGovernorate.Dakahlia, AddressEn = "Gomhoria St, Mansoura", AddressAr = "شارع الجمهورية، المنصورة", PhoneNumber = "0502314567", WorkingHours = "24/7", Latitude = 31.0409, Longitude = 31.3785 },
                new() { NameEn = "Dawa2y Tanta Branch", NameAr = "دوائي طنطا", Governorate = EgyptianGovernorate.Gharbia, AddressEn = "Al Bahr St, Tanta", AddressAr = "شارع البحر، طنطا", PhoneNumber = "0403325678", WorkingHours = "24/7", Latitude = 30.7865, Longitude = 31.0004 },
                new() { NameEn = "Dawa2y Zagazig Branch", NameAr = "دوائي الزقازيق", Governorate = EgyptianGovernorate.Sharqia, AddressEn = "Moahada St, Zagazig", AddressAr = "شارع المعاهدة، الزقازيق", PhoneNumber = "0552345678", WorkingHours = "24/7", Latitude = 30.5877, Longitude = 31.5020 },
                new() { NameEn = "Dawa2y Port Said Branch", NameAr = "دوائي بورسعيد", Governorate = EgyptianGovernorate.PortSaid, AddressEn = "23rd July St, Port Said", AddressAr = "شارع 23 يوليو، بورسعيد", PhoneNumber = "0663245678", WorkingHours = "24/7", Latitude = 31.2653, Longitude = 32.3019 },
                new() { NameEn = "Dawa2y Ismailia Branch", NameAr = "دوائي الإسماعيلية", Governorate = EgyptianGovernorate.Ismailia, AddressEn = "Sultan Hussein St, Ismailia", AddressAr = "شارع السلطان حسين، الإسماعيلية", PhoneNumber = "0643912345", WorkingHours = "24/7", Latitude = 30.6043, Longitude = 32.2723 },
                new() { NameEn = "Dawa2y Suez Branch", NameAr = "دوائي السويس", Governorate = EgyptianGovernorate.Suez, AddressEn = "Al Geish St, Suez", AddressAr = "شارع الجيش، السويس", PhoneNumber = "0623314567", WorkingHours = "24/7", Latitude = 29.9668, Longitude = 32.5498 },
                new() { NameEn = "Dawa2y Damanhour Branch", NameAr = "دوائي دمنهور", Governorate = EgyptianGovernorate.Beheira, AddressEn = "Abdel Salam Aref St, Damanhour", AddressAr = "شارع عبد السلام عارف، دمنهور", PhoneNumber = "0453312345", WorkingHours = "24/7", Latitude = 31.0364, Longitude = 30.4699 },

                // Upper Egypt (5 branches)
                new() { NameEn = "Dawa2y Assiut Branch", NameAr = "دوائي أسيوط", Governorate = EgyptianGovernorate.Assiut, AddressEn = "Yousry Ragheb St, Assiut", AddressAr = "شارع يسري راغب، أسيوط", PhoneNumber = "0882345678", WorkingHours = "24/7", Latitude = 27.1783, Longitude = 31.1859 },
                new() { NameEn = "Dawa2y Minya Branch", NameAr = "دوائي المنيا", Governorate = EgyptianGovernorate.Minya, AddressEn = "Corniche El Nile, Minya", AddressAr = "كورنيش النيل، المنيا", PhoneNumber = "0862345678", WorkingHours = "24/7", Latitude = 28.1099, Longitude = 30.7503 },
                new() { NameEn = "Dawa2y Sohag Branch", NameAr = "دوائي سوهاج", Governorate = EgyptianGovernorate.Sohag, AddressEn = "15th May St, Sohag", AddressAr = "شارع 15 مايو، سوهاج", PhoneNumber = "0932314567", WorkingHours = "24/7", Latitude = 26.5569, Longitude = 31.6948 },
                new() { NameEn = "Dawa2y Luxor Branch", NameAr = "دوائي الأقصر", Governorate = EgyptianGovernorate.Luxor, AddressEn = "Television St, Luxor", AddressAr = "شارع التلفزيون، الأقصر", PhoneNumber = "0952281234", WorkingHours = "24/7", Latitude = 25.6872, Longitude = 32.6396 },
                new() { NameEn = "Dawa2y Aswan Branch", NameAr = "دوائي أسوان", Governorate = EgyptianGovernorate.Aswan, AddressEn = "Abtal El Tahrir St, Aswan", AddressAr = "شارع أبطال التحرير، أسوان", PhoneNumber = "0972314567", WorkingHours = "24/7", Latitude = 24.0889, Longitude = 32.8998 },

                // Red Sea & Sinai & Coastal (3 branches)
                new() { NameEn = "Dawa2y Hurghada Branch", NameAr = "دوائي الغردقة", Governorate = EgyptianGovernorate.RedSea, AddressEn = "Sheraton Road, Hurghada", AddressAr = "طريق شيراتون، الغردقة", PhoneNumber = "0653445678", WorkingHours = "24/7", Latitude = 27.2579, Longitude = 33.8116 },
                new() { NameEn = "Dawa2y Sharm El Sheikh Branch", NameAr = "دوائي شرم الشيخ", Governorate = EgyptianGovernorate.SouthSinai, AddressEn = "Peace Road, Naama Bay", AddressAr = "طريق السلام، خليج نعمة، شرم الشيخ", PhoneNumber = "0693601234", WorkingHours = "24/7", Latitude = 27.9158, Longitude = 34.3299 },
                new() { NameEn = "Dawa2y Marsa Matrouh Branch", NameAr = "دوائي مرسى مطروح", Governorate = EgyptianGovernorate.Matrouh, AddressEn = "Alexandria Road, Marsa Matrouh", AddressAr = "طريق الإسكندرية، مرسى مطروح", PhoneNumber = "0464931234", WorkingHours = "24/7", Latitude = 31.3543, Longitude = 27.2373 }
            };

            context.Branches.AddRange(branches);
            await context.SaveChangesAsync();
        }

        // 3. Seed Products (Authentic Egyptian Pharmaceutical & Healthcare catalog)
        if (!await context.Products.AnyAsync())
        {
            var products = new List<Product>
            {
                // Pain Relief & Antipyretics
                new() {
                    NameEn = "Panadol Extra 24 Tablets",
                    NameAr = "بنادول إكسترا 24 قرص",
                    DescriptionEn = "Fast and effective relief of tough pain and headaches. Formulated with Paracetamol and Caffeine.",
                    DescriptionAr = "تسكين سريع وفعال للآلام الشديدة والصداع النصفي. يحتوي على باراسيتامول وكافيين لتسكين مضاعف.",
                    Sku = "EGY-MED-001",
                    Category = ProductCategory.Medicines,
                    Price = 55.00m,
                    DiscountPrice = 48.00m,
                    ImageUrl = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600",
                    RequiresPrescription = false,
                    Dosage = "1-2 tablets every 4 to 6 hours as needed (Max 8 tablets in 24 hours)",
                    ActiveIngredient = "Paracetamol 500mg, Caffeine 65mg",
                    Manufacturer = "GSK Egypt",
                    TotalStock = 320,
                    IsActive = true
                },
                new() {
                    NameEn = "Brufen 400mg 30 Tablets",
                    NameAr = "بروفين 400 مجم 30 قرص",
                    DescriptionEn = "Anti-inflammatory and analgesic for fever, dental pain, arthritis, and back pain.",
                    DescriptionAr = "مضاد للالتهاب ومسكن لآلام الأسنان والمفاصل وخافض للحرارة.",
                    Sku = "EGY-MED-002",
                    Category = ProductCategory.Medicines,
                    Price = 62.00m,
                    DiscountPrice = null,
                    ImageUrl = "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600",
                    RequiresPrescription = false,
                    Dosage = "1 tablet 3 times daily after meals",
                    ActiveIngredient = "Ibuprofen 400mg",
                    Manufacturer = "Abbott Egypt",
                    TotalStock = 240,
                    IsActive = true
                },
                new() {
                    NameEn = "Ketofan 50mg 20 Capsules",
                    NameAr = "كيتوفان 50 مجم 20 كبسولة",
                    DescriptionEn = "Potent NSAID pain relief for acute muscular and rheumatic conditions.",
                    DescriptionAr = "مسكن قوي لآلام المفاصل والروماتيزم والتقلصات العضلية الحادة.",
                    Sku = "EGY-MED-003",
                    Category = ProductCategory.Medicines,
                    Price = 38.00m,
                    DiscountPrice = 32.50m,
                    ImageUrl = "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600",
                    RequiresPrescription = false,
                    Dosage = "1 capsule twice daily after meals",
                    ActiveIngredient = "Ketoprofen 50mg",
                    Manufacturer = "Amoun Pharmaceutical Co.",
                    TotalStock = 180,
                    IsActive = true
                },
                new() {
                    NameEn = "Cataflam 50mg 20 Tablets",
                    NameAr = "كاتافلام 50 مجم 20 قرص",
                    DescriptionEn = "Rapid relief of painful inflammatory states, dental pain, and dysmenorrhea.",
                    DescriptionAr = "مسكن سريع المفعول لالتهابات الأسنان والصداع وآلام الدورة الشهرية.",
                    Sku = "EGY-MED-004",
                    Category = ProductCategory.Medicines,
                    Price = 72.00m,
                    DiscountPrice = null,
                    ImageUrl = "https://images.unsplash.com/photo-1550572017-edd951b55104?w=600",
                    RequiresPrescription = false,
                    Dosage = "1 tablet 2-3 times daily after food",
                    ActiveIngredient = "Diclofenac Potassium 50mg",
                    Manufacturer = "Novartis Egypt",
                    TotalStock = 210,
                    IsActive = true
                },

                // Cold, Flu & Allergy
                new() {
                    NameEn = "Congestal 20 Tablets",
                    NameAr = "كونجستال 20 قرص",
                    DescriptionEn = "Complete relief from common cold symptoms, runny nose, nasal congestion, and sinus pain.",
                    DescriptionAr = "علاج شامل لأعراض نزلات البرد، الرشح، احتقان الجيوب الأنفية والحرارة.",
                    Sku = "EGY-MED-005",
                    Category = ProductCategory.Medicines,
                    Price = 45.00m,
                    DiscountPrice = 39.00m,
                    ImageUrl = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600",
                    RequiresPrescription = false,
                    Dosage = "1 tablet every 8 hours",
                    ActiveIngredient = "Paracetamol 650mg, Pseudoephedrine 60mg, Chlorpheniramine 4mg",
                    Manufacturer = "Sigma Pharmaceuticals Egypt",
                    TotalStock = 350,
                    IsActive = true
                },
                new() {
                    NameEn = "Telfast 180mg 10 Tablets",
                    NameAr = "تلفاست 180 مجم 10 أقراص",
                    DescriptionEn = "Non-drowsy 24-hour allergy relief for allergic rhinitis and skin hives.",
                    DescriptionAr = "مضاد للحساسية لا يسبب النعاس ممتد المفعول 24 ساعة لحساسية الأنف والجلد.",
                    Sku = "EGY-MED-006",
                    Category = ProductCategory.Medicines,
                    Price = 98.00m,
                    DiscountPrice = 89.00m,
                    ImageUrl = "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600",
                    RequiresPrescription = false,
                    Dosage = "1 tablet once daily before meal",
                    ActiveIngredient = "Fexofenadine HCl 180mg",
                    Manufacturer = "Sanofi Egypt",
                    TotalStock = 190,
                    IsActive = true
                },
                new() {
                    NameEn = "Otrivin Adult 0.1% Nasal Spray 10ml",
                    NameAr = "أوتريفين بخاخ للأنف للكبار 10 مل",
                    DescriptionEn = "Unblocks stuffy nose within 2 minutes for up to 12 hours.",
                    DescriptionAr = "يزيل انسداد الأنف في دقيقتين ويدوم مفعوله حتى 12 ساعة متواصلة.",
                    Sku = "EGY-MED-007",
                    Category = ProductCategory.Medicines,
                    Price = 28.00m,
                    DiscountPrice = null,
                    ImageUrl = "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600",
                    RequiresPrescription = false,
                    Dosage = "1 spray in each nostril 2-3 times daily (Max 5 consecutive days)",
                    ActiveIngredient = "Xylometazoline HCl 0.1%",
                    Manufacturer = "GSK Egypt",
                    TotalStock = 280,
                    IsActive = true
                },

                // Antibiotics (Prescription required)
                new() {
                    NameEn = "Augmentin 1g 14 Tablets",
                    NameAr = "أوجمنتين 1 جم 14 قرص",
                    DescriptionEn = "Broad-spectrum antibacterial treatment for bacterial infections of respiratory tract and ear.",
                    DescriptionAr = "مضاد حيوي واسع المجال لعلاج التهابات الجهاز التنفسي والجيوب الأنفية.",
                    Sku = "EGY-MED-008",
                    Category = ProductCategory.Medicines,
                    Price = 145.00m,
                    DiscountPrice = 135.00m,
                    ImageUrl = "https://images.unsplash.com/photo-1550572017-edd951b55104?w=600",
                    RequiresPrescription = true,
                    Dosage = "1 tablet every 12 hours at the start of a meal",
                    ActiveIngredient = "Amoxicillin 875mg + Clavulanic Acid 125mg",
                    Manufacturer = "Medical Union Pharmaceuticals (MUP)",
                    TotalStock = 160,
                    IsActive = true
                },
                new() {
                    NameEn = "Zithrokan 500mg 3 Capsules",
                    NameAr = "زيثروكان 500 مجم 3 كبسولات",
                    DescriptionEn = "Azithromycin 3-day course for bacterial throat and chest infections.",
                    DescriptionAr = "كورس مضاد حيوي 3 أيام لعلاج التهابات الحلق والشعب الهوائية.",
                    Sku = "EGY-MED-009",
                    Category = ProductCategory.Medicines,
                    Price = 65.00m,
                    DiscountPrice = null,
                    ImageUrl = "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600",
                    RequiresPrescription = true,
                    Dosage = "1 capsule daily 1 hour before or 2 hours after meal for 3 days",
                    ActiveIngredient = "Azithromycin 500mg",
                    Manufacturer = "Hikma Egypt",
                    TotalStock = 120,
                    IsActive = true
                },

                // Chronic Diseases (Diabetes & Hypertension)
                new() {
                    NameEn = "Concor 5mg 30 Tablets",
                    NameAr = "كونكور 5 مجم 30 قرص",
                    DescriptionEn = "Beta-blocker for hypertension management and angina pectoris.",
                    DescriptionAr = "علاج ارتفاع ضغط الدم وتنظيم ضربات القلب وقصور الشرايين التاجية.",
                    Sku = "EGY-CHR-001",
                    Category = ProductCategory.ChronicDiseases,
                    Price = 85.00m,
                    DiscountPrice = 78.00m,
                    ImageUrl = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600",
                    RequiresPrescription = true,
                    Dosage = "1 tablet daily in the morning",
                    ActiveIngredient = "Bisoprolol Fumarate 5mg",
                    Manufacturer = "Merck Egypt",
                    TotalStock = 220,
                    IsActive = true
                },
                new() {
                    NameEn = "Glucophage 1000mg 30 Tablets",
                    NameAr = "جلوكوفاج 1000 مجم 30 قرص",
                    DescriptionEn = "First-line medication for the treatment of type 2 diabetes.",
                    DescriptionAr = "علاج أساسي لمرضى السكري من النوع الثاني وتنظيم مستويات السكر في الدم.",
                    Sku = "EGY-CHR-002",
                    Category = ProductCategory.ChronicDiseases,
                    Price = 72.00m,
                    DiscountPrice = null,
                    ImageUrl = "https://images.unsplash.com/photo-1550572017-edd951b55104?w=600",
                    RequiresPrescription = true,
                    Dosage = "1 tablet twice daily with or after meals",
                    ActiveIngredient = "Metformin HCl 1000mg",
                    Manufacturer = "Merck Serono Egypt",
                    TotalStock = 290,
                    IsActive = true
                },
                new() {
                    NameEn = "Crestor 10mg 28 Tablets",
                    NameAr = "كريستور 10 مجم 28 قرص",
                    DescriptionEn = "Lowers LDL cholesterol and triglycerides in blood while raising HDL.",
                    DescriptionAr = "لخفض الكوليسترول الضار والدهون الثلاثية وحماية القلب والشرايين.",
                    Sku = "EGY-CHR-003",
                    Category = ProductCategory.ChronicDiseases,
                    Price = 280.00m,
                    DiscountPrice = 260.00m,
                    ImageUrl = "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600",
                    RequiresPrescription = true,
                    Dosage = "1 tablet once daily at bedtime",
                    ActiveIngredient = "Rosuvastatin Calcium 10mg",
                    Manufacturer = "AstraZeneca Egypt",
                    TotalStock = 140,
                    IsActive = true
                },

                // Vitamins & Supplements
                new() {
                    NameEn = "C-Retard 500mg 10 Capsules",
                    NameAr = "سي ريتارد 500 مجم 10 كبسولات",
                    DescriptionEn = "Sustained-release Vitamin C for strong immunity and antioxidant defense.",
                    DescriptionAr = "فيتامين سي ممتد المفعول لتقوية المناعة ومقاومة الإجهاد ونزلات البرد.",
                    Sku = "EGY-VIT-001",
                    Category = ProductCategory.VitaminsAndSupplements,
                    Price = 30.00m,
                    DiscountPrice = 26.00m,
                    ImageUrl = "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=600",
                    RequiresPrescription = false,
                    Dosage = "1 capsule daily after breakfast",
                    ActiveIngredient = "Ascorbic Acid (Vitamin C) 500mg",
                    Manufacturer = "Hikma Egypt",
                    TotalStock = 450,
                    IsActive = true
                },
                new() {
                    NameEn = "Limitless Naturals Omega 3 30 Softgels",
                    NameAr = "ليمتلس أوميجا 3 ناتشورالز 30 كبسولة",
                    DescriptionEn = "Triple strength pure fish oil rich in EPA & DHA for heart and brain health.",
                    DescriptionAr = "زيت سمك نقي ثلاثي القوة لدعم صحة القلب والدماغ والمفاصل والتركيز.",
                    Sku = "EGY-VIT-002",
                    Category = ProductCategory.VitaminsAndSupplements,
                    Price = 195.00m,
                    DiscountPrice = 175.00m,
                    ImageUrl = "https://images.unsplash.com/photo-1550572017-edd951b55104?w=600",
                    RequiresPrescription = false,
                    Dosage = "1 softgel daily after main meal",
                    ActiveIngredient = "Fish Oil 1000mg (EPA 300mg + DHA 200mg)",
                    Manufacturer = "Eva Pharma Egypt",
                    TotalStock = 180,
                    IsActive = true
                },
                new() {
                    NameEn = "Neuroton 30 Tablets",
                    NameAr = "نيوروتون 30 قرص",
                    DescriptionEn = "High potency Vitamin B complex (B1, B6, B12) for peripheral neuropathy and nerve support.",
                    DescriptionAr = "مركب فيتامينات ب لعلاج التهابات الأعصاب الطرفية وتنشيط الجسم.",
                    Sku = "EGY-VIT-003",
                    Category = ProductCategory.VitaminsAndSupplements,
                    Price = 75.00m,
                    DiscountPrice = null,
                    ImageUrl = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600",
                    RequiresPrescription = false,
                    Dosage = "1 tablet 1-2 times daily after food",
                    ActiveIngredient = "Vit B1 250mg, Vit B6 200mg, Vit B12 250mcg, Folic Acid",
                    Manufacturer = "Amoun Pharmaceutical Co.",
                    TotalStock = 270,
                    IsActive = true
                },

                // Baby Care
                new() {
                    NameEn = "S-26 Gold Stage 1 Infant Formula 400g",
                    NameAr = "إس-26 جولد المرحلة 1 حليب أطفال 400 جم",
                    DescriptionEn = "Nutritional formula for infants from birth up to 6 months with HMOs.",
                    DescriptionAr = "حليب أطفال مدعم بالمركبات الحيوية والمغذيات المتكاملة من عمر الولادة حتى 6 أشهر.",
                    Sku = "EGY-BABY-001",
                    Category = ProductCategory.BabyCare,
                    Price = 340.00m,
                    DiscountPrice = 319.00m,
                    ImageUrl = "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600",
                    RequiresPrescription = false,
                    Dosage = "As directed by pediatrician on can label",
                    ActiveIngredient = "Infant Milk Formula with DHA & Lutein",
                    Manufacturer = "Wyeth Nutrition / Nestle",
                    TotalStock = 85,
                    IsActive = true
                },
                new() {
                    NameEn = "SUDOCREM Antiseptic Healing Cream 125g",
                    NameAr = "سودوكريم كريم مطهر ومرمم 125 جم",
                    DescriptionEn = "Proven soothing cream for diaper rash, eczema, minor burns and abrasions.",
                    DescriptionAr = "كريم علاجي ومهدئ لالتهابات الحفاضات والأكزيما وحروق الشمس والجلد المتهيج.",
                    Sku = "EGY-BABY-002",
                    Category = ProductCategory.BabyCare,
                    Price = 210.00m,
                    DiscountPrice = 185.00m,
                    ImageUrl = "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600",
                    RequiresPrescription = false,
                    Dosage = "Apply thin layer to clean skin at every diaper change",
                    ActiveIngredient = "Zinc Oxide 15.25%, Benzyl Benzoate 1.01%",
                    Manufacturer = "Teva Pharmaceuticals",
                    TotalStock = 160,
                    IsActive = true
                },

                // Skin Care
                new() {
                    NameEn = "Bepanthen Moisturizing Cream 30g",
                    NameAr = "كريم بيبانثين المرطب 30 جم",
                    DescriptionEn = "Pro-Vitamin B5 deep hydration cream for dry, damaged and sensitive skin.",
                    DescriptionAr = "كريم مرطب عميق ببرو فيتامين ب5 لتجديد خلايا البشرة الجافة والحساسة.",
                    Sku = "EGY-SKIN-001",
                    Category = ProductCategory.SkinCare,
                    Price = 120.00m,
                    DiscountPrice = 105.00m,
                    ImageUrl = "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600",
                    RequiresPrescription = false,
                    Dosage = "Apply gently to affected area 1-2 times daily",
                    ActiveIngredient = "Dexpanthenol (Pro-Vitamin B5) 5%",
                    Manufacturer = "Bayer Egypt",
                    TotalStock = 240,
                    IsActive = true
                },
                new() {
                    NameEn = "La Roche-Posay Anthelios SPF50+ Invisible Fluid",
                    NameAr = "واقي شمس لاروش بوزيه أنثيليوس SPF50+",
                    DescriptionEn = "Ultra-high broad-spectrum UVA/UVB protection without white cast or greasiness.",
                    DescriptionAr = "حماية فائقة من أشعة الشمس فوق البنفسجية بملمس خفيف غير دهني مناسب للبشرة الحساسة.",
                    Sku = "EGY-SKIN-002",
                    Category = ProductCategory.SkinCare,
                    Price = 580.00m,
                    DiscountPrice = 520.00m,
                    ImageUrl = "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600",
                    RequiresPrescription = false,
                    Dosage = "Apply 20 minutes before sun exposure, reapply every 2 hours",
                    ActiveIngredient = "Mexoryl 400 + Netlock Technology",
                    Manufacturer = "L'Oreal Active Cosmetics",
                    TotalStock = 70,
                    IsActive = true
                },

                // First Aid
                new() {
                    NameEn = "Betadine Antiseptic Solution 120ml",
                    NameAr = "بيتادين مطهر للجروح 120 مل",
                    DescriptionEn = "Standard topical microbicidal solution for prompt cleansing of cuts and wounds.",
                    DescriptionAr = "محلول مطهر واسع المدى لتنظيف وتطهير الجروح والحروق السطحية.",
                    Sku = "EGY-AID-001",
                    Category = ProductCategory.FirstAid,
                    Price = 48.00m,
                    DiscountPrice = null,
                    ImageUrl = "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600",
                    RequiresPrescription = false,
                    Dosage = "Apply directly to wound using sterile gauze",
                    ActiveIngredient = "Povidone-Iodine 10%",
                    Manufacturer = "Mundipharma / Nile Co. Egypt",
                    TotalStock = 300,
                    IsActive = true
                }
            };

            context.Products.AddRange(products);
            await context.SaveChangesAsync();

            // Link products to branch inventories
            var allBranches = await context.Branches.ToListAsync();
            foreach (var prod in products)
            {
                var perBranch = Math.Max(2, prod.TotalStock / allBranches.Count);
                foreach (var branch in allBranches)
                {
                    context.BranchInventories.Add(new BranchInventory
                    {
                        BranchId = branch.Id,
                        ProductId = prod.Id,
                        Quantity = perBranch,
                        ReorderThreshold = 10,
                        LastRestockedAt = DateTime.UtcNow
                    });
                }
            }
            await context.SaveChangesAsync();
        }

        // 4. Seed Daily Insights baseline (~5000 visits/day)
        if (!await context.DailyInsights.AnyAsync())
        {
            var today = DateTime.UtcNow.Date;
            for (int i = 14; i >= 0; i--)
            {
                var date = today.AddDays(-i);
                context.DailyInsights.Add(new DailyInsight
                {
                    Date = date,
                    UniqueVisitors = 4900 + Random.Shared.Next(0, 450),
                    TotalOrders = 135 + Random.Shared.Next(0, 40),
                    TotalRevenue = 28000m + Random.Shared.Next(2000, 12000),
                    ItemsSold = 380 + Random.Shared.Next(0, 100)
                });
            }
            await context.SaveChangesAsync();
        }
    }
}

