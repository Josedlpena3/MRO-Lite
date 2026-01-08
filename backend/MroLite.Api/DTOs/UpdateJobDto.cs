using System.Collections.Generic;

namespace MroLite.Api.DTOs
{
    public class UpdateJobDto
    {
        public string Equipment { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public string Plane { get; set; } = string.Empty;

        public List<int> TechnicianIds { get; set; } = new();

        public string Status { get; set; } = "Pending";
        public string? Notes { get; set; }
        public bool Anomaly { get; set; }
    }
}
