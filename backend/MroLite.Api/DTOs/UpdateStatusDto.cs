using System.ComponentModel.DataAnnotations;

namespace MroLite.Api.DTOs
{
    public class UpdateStatusDto
    {
        [Required]
        public string Status { get; set; } = null!;
    }
}
