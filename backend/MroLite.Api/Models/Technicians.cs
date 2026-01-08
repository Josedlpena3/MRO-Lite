using System.Collections.Generic;

namespace MroLite.Api.Models
{
    public class Technician
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        // MANY-TO-MANY
        public ICollection<MaintenanceJob> MaintenanceJobs { get; set; } = new List<MaintenanceJob>();
    }
}
