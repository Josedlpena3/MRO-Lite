using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MroLite.Api.Data;
using MroLite.Api.DTOs;
using MroLite.Api.Models;

namespace MroLite.Api.Controllers
{
    /// <summary>
    /// Endpoints para gestionar tecnicos.
    /// </summary>
    [ApiController]
    [Route("technicians")]
    [Produces("application/json")]
    public class TechniciansController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TechniciansController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Lista todos los tecnicos.
        /// </summary>
        /// <response code="200">Listado de tecnicos.</response>
        [ProducesResponseType(typeof(IEnumerable<TechnicianDto>), StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TechnicianDto>>> GetAll()
        {
            var technicians = await _context.Technicians
                .AsNoTracking()
                .Select(t => new TechnicianDto { Id = t.Id, Name = t.Name })
                .ToListAsync();

            return Ok(technicians);
        }

        /// <summary>
        /// Obtiene un tecnico por id.
        /// </summary>
        /// <response code="200">Tecnico encontrado.</response>
        /// <response code="404">Tecnico no encontrado.</response>
        [ProducesResponseType(typeof(TechnicianDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpGet("{id}")]
        public async Task<ActionResult<TechnicianDto>> GetById(int id)
        {
            var technician = await _context.Technicians.FindAsync(id);

            if (technician == null)
                return NotFound();

            return Ok(new TechnicianDto { Id = technician.Id, Name = technician.Name });
        }

        /// <summary>
        /// Crea un tecnico.
        /// </summary>
        /// <remarks>
        /// Ejemplo de request:
        /// <![CDATA[
        /// { "name": "Juan Perez" }
        /// ]]>
        /// </remarks>
        /// <response code="201">Tecnico creado.</response>
        /// <response code="400">Datos invalidos.</response>
        [ProducesResponseType(typeof(TechnicianDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [HttpPost]
        public async Task<ActionResult> Create(CreateTechnicianDto dto)
        {
            var technician = new Technician { Name = dto.Name };

            _context.Technicians.Add(technician);
            await _context.SaveChangesAsync();

            var result = new TechnicianDto { Id = technician.Id, Name = technician.Name };
            return CreatedAtAction(nameof(GetById), new { id = technician.Id }, result);
        }

        /// <summary>
        /// Actualiza un tecnico.
        /// </summary>
        /// <remarks>
        /// Ejemplo de request:
        /// <![CDATA[
        /// { "name": "Carlos Gomez" }
        /// ]]>
        /// </remarks>
        /// <response code="204">Tecnico actualizado.</response>
        /// <response code="400">Datos invalidos.</response>
        /// <response code="404">Tecnico no encontrado.</response>
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, UpdateTechnicianDto dto)
        {
            var technician = await _context.Technicians.FindAsync(id);

            if (technician == null)
                return NotFound();

            technician.Name = dto.Name;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Elimina un tecnico por id.
        /// </summary>
        /// <response code="204">Tecnico eliminado.</response>
        /// <response code="404">Tecnico no encontrado.</response>
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var technician = await _context.Technicians.FindAsync(id);

            if (technician == null)
                return NotFound();

            _context.Technicians.Remove(technician);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
