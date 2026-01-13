using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MroLite.Api.Data;
using MroLite.Api.DTOs;
using MroLite.Api.Models;

namespace MroLite.Api.Controllers
{
    /// <summary>
    /// Endpoints para gestionar trabajos de mantenimiento.
    /// </summary>
    [ApiController]
    [Route("maintenancejobs")]
    [Produces("application/json")]
    public class MaintenanceJobsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MaintenanceJobsController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Lista trabajos de mantenimiento con paginacion, filtros y ordenamiento.
        /// </summary>
        /// <param name="page">Numero de pagina (>= 1).</param>
        /// <param name="pageSize">Cantidad por pagina (1-100).</param>
        /// <param name="sortBy">Campo: id, equipment, company, plane, status, createdAt, updatedAt.</param>
        /// <param name="sortDir">Direccion: asc o desc.</param>
        /// <param name="status">Filtra por estado.</param>
        /// <param name="company">Filtra por compania (contiene).</param>
        /// <param name="plane">Filtra por avion (contiene).</param>
        /// <param name="equipment">Filtra por equipo (contiene).</param>
        /// <param name="anomaly">Filtra por anomalia.</param>
        /// <param name="search">Busca en equipment, company, plane, notes.</param>
        /// <remarks>
        /// Ejemplo de respuesta:
        /// <![CDATA[
        /// {
        ///   "page": 1,
        ///   "pageSize": 20,
        ///   "total": 1,
        ///   "items": [
        ///     {
        ///       "id": 1,
        ///       "equipment": "Boeing 737",
        ///       "company": "Aerolineas Argentinas",
        ///       "plane": "LV-FUA",
        ///       "status": "Pendiente",
        ///       "notes": "Revision general previa a vuelo",
        ///       "anomaly": false,
        ///       "createdAt": "2024-01-01T12:00:00Z",
        ///       "updatedAt": "2024-01-01T12:00:00Z",
        ///       "technicians": [
        ///         { "id": 1, "name": "Juan Perez" }
        ///       ]
        ///     }
        ///   ]
        /// }
        /// ]]>
        /// </remarks>
        /// <response code="200">Listado paginado de trabajos.</response>
        /// <response code="400">Parametros invalidos.</response>
        [ProducesResponseType(typeof(PagedResult<MaintenanceJobDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [HttpGet]
        public async Task<ActionResult<PagedResult<MaintenanceJobDto>>> GetAll(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string sortBy = "createdAt",
            [FromQuery] string sortDir = "desc",
            [FromQuery] MaintenanceJobStatus? status = null,
            [FromQuery] string? company = null,
            [FromQuery] string? plane = null,
            [FromQuery] string? equipment = null,
            [FromQuery] bool? anomaly = null,
            [FromQuery] string? search = null)
        {
            if (page < 1 || pageSize < 1 || pageSize > 100)
                return BadRequest(new { message = "Invalid pagination parameters.", allowedPageSize = "1-100" });

            var direction = string.IsNullOrWhiteSpace(sortDir) ? "desc" : sortDir.Trim().ToLowerInvariant();
            if (direction != "asc" && direction != "desc")
                return BadRequest(new { message = "Invalid sortDir. Use 'asc' or 'desc'." });

            var sortKey = string.IsNullOrWhiteSpace(sortBy) ? "createdat" : sortBy.Trim().ToLowerInvariant();

            IQueryable<MaintenanceJob> query = _context.MaintenanceJobs
                .AsNoTracking()
                .Include(j => j.Technicians);

            if (status.HasValue)
                query = query.Where(j => j.Status == status.Value.ToString());

            if (!string.IsNullOrWhiteSpace(company))
                query = query.Where(j => EF.Functions.Like(j.Company, $"%{company.Trim()}%"));

            if (!string.IsNullOrWhiteSpace(plane))
                query = query.Where(j => EF.Functions.Like(j.Plane, $"%{plane.Trim()}%"));

            if (!string.IsNullOrWhiteSpace(equipment))
                query = query.Where(j => EF.Functions.Like(j.Equipment, $"%{equipment.Trim()}%"));

            if (anomaly.HasValue)
                query = query.Where(j => j.Anomaly == anomaly.Value);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(j =>
                    EF.Functions.Like(j.Equipment, $"%{term}%") ||
                    EF.Functions.Like(j.Company, $"%{term}%") ||
                    EF.Functions.Like(j.Plane, $"%{term}%") ||
                    (j.Notes != null && EF.Functions.Like(j.Notes, $"%{term}%")));
            }

            IQueryable<MaintenanceJob>? orderedQuery = sortKey switch
            {
                "id" => direction == "desc" ? query.OrderByDescending(j => j.Id) : query.OrderBy(j => j.Id),
                "equipment" => direction == "desc" ? query.OrderByDescending(j => j.Equipment) : query.OrderBy(j => j.Equipment),
                "company" => direction == "desc" ? query.OrderByDescending(j => j.Company) : query.OrderBy(j => j.Company),
                "plane" => direction == "desc" ? query.OrderByDescending(j => j.Plane) : query.OrderBy(j => j.Plane),
                "status" => direction == "desc" ? query.OrderByDescending(j => j.Status) : query.OrderBy(j => j.Status),
                "createdat" => direction == "desc" ? query.OrderByDescending(j => j.CreatedAt) : query.OrderBy(j => j.CreatedAt),
                "updatedat" => direction == "desc" ? query.OrderByDescending(j => j.UpdatedAt) : query.OrderBy(j => j.UpdatedAt),
                _ => null
            };

            if (orderedQuery == null)
            {
                return BadRequest(new
                {
                    message = "Invalid sortBy.",
                    allowed = new[] { "id", "equipment", "company", "plane", "status", "createdAt", "updatedAt" }
                });
            }

            var total = await orderedQuery.CountAsync();
            var items = await orderedQuery
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var result = new PagedResult<MaintenanceJobDto>
            {
                Page = page,
                PageSize = pageSize,
                Total = total,
                Items = items.Select(MapJob).ToList()
            };

            return Ok(result);
        }

        /// <summary>
        /// Obtiene un trabajo por id.
        /// </summary>
        /// <remarks>
        /// Ejemplo de respuesta:
        /// <![CDATA[
        /// {
        ///   "id": 1,
        ///   "equipment": "Boeing 737",
        ///   "company": "Aerolineas Argentinas",
        ///   "plane": "LV-FUA",
        ///   "status": "Pendiente",
        ///   "notes": "Revision general previa a vuelo",
        ///   "anomaly": false,
        ///   "createdAt": "2024-01-01T12:00:00Z",
        ///   "updatedAt": "2024-01-01T12:00:00Z",
        ///   "technicians": [
        ///     { "id": 1, "name": "Juan Perez" }
        ///   ]
        /// }
        /// ]]>
        /// </remarks>
        /// <response code="200">Trabajo encontrado.</response>
        /// <response code="404">Trabajo no encontrado.</response>
        [ProducesResponseType(typeof(MaintenanceJobDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpGet("{id}")]
        public async Task<ActionResult<MaintenanceJobDto>> GetById(int id)
        {
            var job = await _context.MaintenanceJobs
                .AsNoTracking()
                .Include(j => j.Technicians)
                .FirstOrDefaultAsync(j => j.Id == id);

            if (job == null)
                return NotFound();

            return Ok(MapJob(job));
        }

        /// <summary>
        /// Lista trabajos filtrados por estado.
        /// </summary>
        /// <remarks>
        /// Estados validos: Pendiente, EnProceso, Completado.
        /// </remarks>
        /// <response code="200">Listado filtrado por estado.</response>
        /// <response code="400">Estado invalido.</response>
        [ProducesResponseType(typeof(IEnumerable<MaintenanceJobDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [HttpGet("status/{status}")]
        public async Task<ActionResult<IEnumerable<MaintenanceJobDto>>> GetByStatus(MaintenanceJobStatus status)
        {
            var statusValue = status.ToString();
            var jobs = await _context.MaintenanceJobs
                .AsNoTracking()
                .Include(j => j.Technicians)
                .Where(j => j.Status == statusValue)
                .ToListAsync();

            return Ok(jobs.Select(MapJob).ToList());
        }

        /// <summary>
        /// Crea un trabajo de mantenimiento.
        /// </summary>
        /// <remarks>
        /// Ejemplo de request:
        /// <![CDATA[
        /// {
        ///   "equipment": "Boeing 737",
        ///   "company": "Aerolineas Argentinas",
        ///   "plane": "LV-FUA",
        ///   "technicianIds": [1, 2],
        ///   "status": "Pendiente",
        ///   "notes": "Revision general previa a vuelo",
        ///   "anomaly": false
        /// }
        /// ]]>
        /// </remarks>
        /// <response code="201">Trabajo creado.</response>
        /// <response code="400">Datos invalidos o tecnicos inexistentes.</response>
        [ProducesResponseType(typeof(MaintenanceJobDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [HttpPost]
        public async Task<ActionResult> Create(CreateJobDto dto)
        {
            var completionValidation = ValidateCompletionStatus(dto.Status, dto.Notes);
            if (completionValidation != null)
                return completionValidation;

            var (technicians, missingIds) = await ResolveTechniciansAsync(dto.TechnicianIds);
            if (missingIds.Count > 0)
                return BadRequest(new { message = "Some technicians were not found.", missingIds });

            var utcNow = DateTime.UtcNow;
            var job = new MaintenanceJob
            {
                Equipment = dto.Equipment,
                Company = dto.Company,
                Plane = dto.Plane,
                Status = dto.Status.ToString(),
                Notes = dto.Notes,
                Anomaly = dto.Anomaly,
                Technicians = technicians,
                CreatedAt = utcNow,
                UpdatedAt = utcNow
            };

            _context.MaintenanceJobs.Add(job);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = job.Id }, MapJob(job));
        }

        /// <summary>
        /// Actualiza un trabajo existente.
        /// </summary>
        /// <remarks>
        /// Ejemplo de request:
        /// <![CDATA[
        /// {
        ///   "equipment": "Boeing 737",
        ///   "company": "Aerolineas Argentinas",
        ///   "plane": "LV-FUA",
        ///   "technicianIds": [1, 2],
        ///   "status": "EnProceso",
        ///   "notes": "Cambio de filtro hidraulico",
        ///   "anomaly": true
        /// }
        /// ]]>
        /// </remarks>
        /// <response code="204">Trabajo actualizado.</response>
        /// <response code="400">Datos invalidos o tecnicos inexistentes.</response>
        /// <response code="404">Trabajo no encontrado.</response>
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, UpdateJobDto dto)
        {
            var job = await _context.MaintenanceJobs
                .Include(j => j.Technicians)
                .FirstOrDefaultAsync(j => j.Id == id);

            if (job == null)
                return NotFound();

            var status = dto.Status!.Value;
            var completionValidation = ValidateCompletionStatus(status, dto.Notes);
            if (completionValidation != null)
                return completionValidation;

            var (technicians, missingIds) = await ResolveTechniciansAsync(dto.TechnicianIds);
            if (missingIds.Count > 0)
                return BadRequest(new { message = "Some technicians were not found.", missingIds });

            job.Equipment = dto.Equipment;
            job.Company = dto.Company;
            job.Plane = dto.Plane;
            job.Status = status.ToString();
            job.Notes = dto.Notes;
            job.Anomaly = dto.Anomaly;
            job.Technicians = technicians;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Actualiza solo el estado de un trabajo.
        /// </summary>
        /// <remarks>
        /// Ejemplo de request:
        /// <![CDATA[
        /// { "status": "Completado" }
        /// ]]>
        /// </remarks>
        /// <response code="204">Estado actualizado.</response>
        /// <response code="400">Datos invalidos.</response>
        /// <response code="404">Trabajo no encontrado.</response>
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpPatch("{id}/status")]
        public async Task<ActionResult> UpdateStatus(int id, UpdateStatusDto dto)
        {
            var job = await _context.MaintenanceJobs.FindAsync(id);

            if (job == null)
                return NotFound();

            var status = dto.Status!.Value;
            var completionValidation = ValidateCompletionStatus(status, job.Notes);
            if (completionValidation != null)
                return completionValidation;

            job.Status = status.ToString();
            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Elimina un trabajo por id.
        /// </summary>
        /// <response code="204">Trabajo eliminado.</response>
        /// <response code="404">Trabajo no encontrado.</response>
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var job = await _context.MaintenanceJobs.FindAsync(id);

            if (job == null)
                return NotFound();

            _context.MaintenanceJobs.Remove(job);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task<(List<Technician> technicians, List<int> missingIds)> ResolveTechniciansAsync(IEnumerable<int>? technicianIds)
        {
            var ids = technicianIds?.Distinct().ToList() ?? new List<int>();
            if (ids.Count == 0)
                return (new List<Technician>(), new List<int>());

            var technicians = await _context.Technicians
                .Where(t => ids.Contains(t.Id))
                .ToListAsync();

            var foundIds = technicians.Select(t => t.Id);
            var missingIds = ids.Except(foundIds).ToList();

            return (technicians, missingIds);
        }

        private ActionResult? ValidateCompletionStatus(MaintenanceJobStatus status, string? notes)
        {
            if (status != MaintenanceJobStatus.Completado)
                return null;

            if (!string.IsNullOrWhiteSpace(notes))
                return null;

            return BadRequest(new { message = "Notes are required when status is Completado." });
        }

        private static MaintenanceJobDto MapJob(MaintenanceJob job)
        {
            var status = Enum.TryParse<MaintenanceJobStatus>(job.Status, true, out var parsed)
                ? parsed
                : MaintenanceJobStatus.Pendiente;

            return new MaintenanceJobDto
            {
                Id = job.Id,
                Equipment = job.Equipment,
                Company = job.Company,
                Plane = job.Plane,
                Status = status,
                Notes = job.Notes,
                Anomaly = job.Anomaly,
                CreatedAt = job.CreatedAt,
                UpdatedAt = job.UpdatedAt,
                Technicians = job.Technicians
                    .Select(t => new TechnicianDto { Id = t.Id, Name = t.Name })
                    .ToList()
            };
        }
    }
}
