using MroLite.Api.Models;

namespace MroLite.Api.Data
{
    public static class SeedData
    {
        public static void Initialize(ApplicationDbContext context)
        {
            if (context.Technicians.Any() || context.MaintenanceJobs.Any())
                return;

            var technicians = new List<Technician>
            {
                new Technician { Name = "Juan Perez" },
                new Technician { Name = "Carlos Gomez" },
                new Technician { Name = "Lucia Martinez" },
                new Technician { Name = "Sofia Ruiz" }
            };

            var jobs = new List<MaintenanceJob>
            {
                new MaintenanceJob
                {
                    Equipment = "Boeing 737",
                    Company = "Aerolineas Argentinas",
                    Plane = "LV-FUA",
                    Status = "Pendiente",
                    Notes = "Revision general previa a vuelo",
                    Anomaly = false,
                    Technicians = new List<Technician> { technicians[0], technicians[1] }
                },
                new MaintenanceJob
                {
                    Equipment = "Airbus A320",
                    Company = "LATAM",
                    Plane = "CC-BFQ",
                    Status = "EnProceso",
                    Notes = "Cambio de filtro hidraulico",
                    Anomaly = true,
                    Technicians = new List<Technician> { technicians[2] }
                },
                new MaintenanceJob
                {
                    Equipment = "Embraer 190",
                    Company = "Flybondi",
                    Plane = "LV-HKA",
                    Status = "Completado",
                    Notes = "Inspeccion de cabina completa",
                    Anomaly = false,
                    Technicians = new List<Technician> { technicians[3] }
                }
            };

            context.Technicians.AddRange(technicians);
            context.MaintenanceJobs.AddRange(jobs);
            context.SaveChanges();
        }
    }
}
