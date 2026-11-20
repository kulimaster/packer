using System.Globalization;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Packer.Application.Trips.AssignCategoryBag;
using Packer.Application.Trips.CreateBag;
using Packer.Application.Trips.CreateCategory;
using Packer.Application.Trips.CreateItem;
using Packer.Application.Trips.CreateTrip;
using Packer.Application.Trips.DeleteBag;
using Packer.Application.Trips.DeleteCategory;
using Packer.Application.Trips.DeleteItem;
using Packer.Application.Trips.DeleteTrip;
using Packer.Application.Templates.GetTemplate;
using Packer.Application.Templates.GetTemplates;
using Packer.Application.Trips.GetTrip;
using Packer.Application.Trips.GetTrips;
using Packer.Application.Trips.ImportTemplates;
using Packer.Application.Trips.SetItemPacked;
using Packer.Application.Trips.SetTripArchived;
using Packer.Application.Trips.UpdateBag;
using Packer.Application.Trips.UpdateCategory;
using Packer.Application.Trips.UpdateItem;
using Packer.Application.Trips.UpdateTrip;

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
        services.AddScoped<UpdateTripHandler>();
        services.AddScoped<DeleteTripHandler>();
        services.AddScoped<CreateCategoryHandler>();
        services.AddScoped<UpdateCategoryHandler>();
        services.AddScoped<DeleteCategoryHandler>();
        services.AddScoped<CreateItemHandler>();
        services.AddScoped<SetItemPackedHandler>();
        services.AddScoped<UpdateItemHandler>();
        services.AddScoped<DeleteItemHandler>();
        services.AddScoped<CreateBagHandler>();
        services.AddScoped<UpdateBagHandler>();
        services.AddScoped<DeleteBagHandler>();
        services.AddScoped<AssignCategoryBagHandler>();
        services.AddScoped<SetTripArchivedHandler>();
        services.AddScoped<GetTemplatesHandler>();
        services.AddScoped<GetTemplateHandler>();
        services.AddScoped<ImportTemplatesHandler>();

        services.AddScoped<IValidator<CreateTripRequest>, CreateTripRequestValidator>();
        services.AddScoped<IValidator<UpdateTripRequest>, UpdateTripRequestValidator>();
        services.AddScoped<IValidator<CreateCategoryRequest>, CreateCategoryRequestValidator>();
        services.AddScoped<IValidator<UpdateCategoryRequest>, UpdateCategoryRequestValidator>();
        services.AddScoped<IValidator<CreateItemRequest>, CreateItemRequestValidator>();
        services.AddScoped<IValidator<UpdateItemRequest>, UpdateItemRequestValidator>();
        services.AddScoped<IValidator<CreateBagRequest>, CreateBagRequestValidator>();
        services.AddScoped<IValidator<UpdateBagRequest>, UpdateBagRequestValidator>();
        services.AddScoped<IValidator<AssignCategoryBagRequest>, AssignCategoryBagRequestValidator>();
        services.AddScoped<IValidator<ImportTemplatesRequest>, ImportTemplatesRequestValidator>();

        return services;
    }
}
