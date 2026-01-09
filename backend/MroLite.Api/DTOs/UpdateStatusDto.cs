using System.ComponentModel.DataAnnotations;

namespace MroLite.Api.DTOs
{
    public class UpdateStatusDto
    {
        [Required]
        public MaintenanceJobStatus? Status { get; set; }
    }
}
