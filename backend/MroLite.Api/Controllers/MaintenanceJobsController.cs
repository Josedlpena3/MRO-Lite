using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MroLite.Api.Data;
using MroLite.Api.Models;
using MroLite.Api.DTOs;

namespace MroLite.Api.Controllers
{
    [ApiController]
    [Route("maintenancejobs")]
    public class MaintenanceJobsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MaintenanceJobsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET /maintenancejobs
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MaintenanceJob>>> GetAll()
        {
            var jobs = await _context.MaintenanceJobs
                .Include(j => j.Technicians)
                .ToListAsync();

            return Ok(jobs);
        }

        // POST /maintenancejobs
        [HttpPost]
        public async Task<ActionResult> Create(CreateJobDto dto)
        {
            var technicians = await _context.Technicians
                .Where(t => dto.TechnicianIds.Contains(t.Id))
                .ToListAsync();

            var job = new MaintenanceJob
            {
                Equipment = dto.Equipment,
                Company = dto.Company,
                Plane = dto.Plane,
                Status = "Pending",
                Notes = dto.Notes,
                Anomaly = dto.Anomaly,
                Technicians = technicians
            };

            _context.MaintenanceJobs.Add(job);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAll), new { id = job.Id }, job);
        }

        // PUT /maintenancejobs/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, UpdateJobDto dto)
        {
            var job = await _context.MaintenanceJobs
                .Include(j => j.Technicians)
                .FirstOrDefaultAsync(j => j.Id == id);

            if (job == null)
                return NotFound();

            var technicians = await _context.Technicians
                .Where(t => dto.TechnicianIds.Contains(t.Id))
                .ToListAsync();

            job.Equipment = dto.Equipment;
            job.Company = dto.Company;
            job.Plane = dto.Plane;
            job.Status = dto.Status;
            job.Notes = dto.Notes;
            job.Anomaly = dto.Anomaly;
            job.Technicians = technicians;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PATCH /maintenancejobs/{id}/status
        [HttpPatch("{id}/status")]
        public async Task<ActionResult> UpdateStatus(int id, UpdateStatusDto dto)
        {
            var job = await _context.MaintenanceJobs.FindAsync(id);

            if (job == null)
                return NotFound();

            job.Status = dto.Status;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE /maintenancejobs/{id}
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
    }
}
