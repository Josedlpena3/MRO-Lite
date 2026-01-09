using System;
using System.Collections.Generic;

namespace MroLite.Api.DTOs
{
    public class MaintenanceJobDto
    {
        public int Id { get; set; }
        public string Equipment { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public string Plane { get; set; } = string.Empty;
        public MaintenanceJobStatus Status { get; set; } = MaintenanceJobStatus.Pendiente;
        public string? Notes { get; set; }
        public bool Anomaly { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<TechnicianDto> Technicians { get; set; } = new();
    }
}
