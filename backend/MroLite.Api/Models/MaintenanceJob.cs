using System;
using System.Collections.Generic;

namespace MroLite.Api.Models
{
    public class MaintenanceJob
    {
        public int Id { get; set; }

        public string Equipment { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public string Plane { get; set; } = string.Empty;

        // MANY-TO-MANY
        public ICollection<Technician> Technicians { get; set; } = new List<Technician>();

        public string Status { get; set; } = "Pending";
        public string? Notes { get; set; }
        public bool Anomaly { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
