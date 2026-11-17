using System.Globalization;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Packer.Application.Trips.AssignCategoryBag;
using Packer.Application.Trips.CreateBag;
using Packer.Application.Trips.CreateCategory;
using Packer.Application.Trips.CreateItem;
using Packer.Application.Trips.CreateTrip;
using Packer.Application.Trips.DeleteBag;
using Packer.Application.Trips.DeleteItem;
using Packer.Application.Trips.GetTrip;
using Packer.Application.Trips.GetTrips;
using Packer.Application.Trips.SetItemPacked;
using Packer.Application.Trips.UpdateBag;

namespace Packer.Application.Common;

public static class ApplicationServiceCollectionExtensions
{
    /// <summary>
    /// Registrace use case handlerů a validátorů. Ruční seznam místo skenování assembly:
    /// je vidět, co Application umí, a start aplikace nezdržuje reflexe.
    /// </summary>
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // UI i API mluví anglicky – bez tohohle by FluentValidation vracel české hlášky
        // podle UI culture serveru a klient by dostával mix jazyků.
        ValidatorOptions.Global.LanguageManager.Culture = CultureInfo.GetCultureInfo("en");

        services.AddScoped<GetTripsHandler>();
        services.AddScoped<GetTripHandler>();
        services.AddScoped<CreateTripHandler>();
        services.AddScoped<CreateCategoryHandler>();
        services.AddScoped<CreateItemHandler>();
        services.AddScoped<SetItemPackedHandler>();
        services.AddScoped<DeleteItemHandler>();
        services.AddScoped<CreateBagHandler>();
        services.AddScoped<UpdateBagHandler>();
        services.AddScoped<DeleteBagHandler>();
        services.AddScoped<AssignCategoryBagHandler>();

        services.AddScoped<IValidator<CreateTripRequest>, CreateTripRequestValidator>();
        services.AddScoped<IValidator<CreateCategoryRequest>, CreateCategoryRequestValidator>();
        services.AddScoped<IValidator<CreateItemRequest>, CreateItemRequestValidator>();
        services.AddScoped<IValidator<CreateBagRequest>, CreateBagRequestValidator>();
        services.AddScoped<IValidator<UpdateBagRequest>, UpdateBagRequestValidator>();
        services.AddScoped<IValidator<AssignCategoryBagRequest>, AssignCategoryBagRequestValidator>();

        return services;
    }
}
