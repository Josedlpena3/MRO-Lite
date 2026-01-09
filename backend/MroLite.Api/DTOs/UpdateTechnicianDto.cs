using System.ComponentModel.DataAnnotations;

namespace MroLite.Api.DTOs
{
    public class UpdateTechnicianDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
    }
}
