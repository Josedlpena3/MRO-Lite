using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MroLite.Api.DTOs
{
    public class CreateJobDto
    {
        [Required]
        [StringLength(100)]
        public string Equipment { get; set; } = string.Empty;
        [Required]
        [StringLength(100)]
        public string Company { get; set; } = string.Empty;
        [Required]
        [StringLength(100)]
        public string Plane { get; set; } = string.Empty;

        // IDs, no strings
        public List<int> TechnicianIds { get; set; } = new();

        public MaintenanceJobStatus Status { get; set; } = MaintenanceJobStatus.Pendiente;
        [StringLength(500)]
        public string? Notes { get; set; }
        public bool Anomaly { get; set; }
    }
}
