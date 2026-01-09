using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MroLite.Api.DTOs
{
    public class UpdateJobDto
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

        public List<int> TechnicianIds { get; set; } = new();

        [Required]
        public MaintenanceJobStatus? Status { get; set; }
        [StringLength(500)]
        public string? Notes { get; set; }
        public bool Anomaly { get; set; }
    }
}
