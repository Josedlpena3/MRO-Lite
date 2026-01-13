using Microsoft.EntityFrameworkCore;
using MroLite.Api.Models;

namespace MroLite.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<MaintenanceJob> MaintenanceJobs => Set<MaintenanceJob>();
        public DbSet<Technician> Technicians => Set<Technician>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<MaintenanceJob>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();

                entity.Property(e => e.Equipment).IsRequired();
                entity.Property(e => e.Company).IsRequired();
                entity.Property(e => e.Plane).IsRequired();
                entity.Property(e => e.Status).IsRequired();

                entity.Property(e => e.CreatedAt)
                      .HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt)
                      .HasDefaultValueSql("GETUTCDATE()");
            });

            modelBuilder.Entity<Technician>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired();
            });

            // MANY-TO-MANY CONFIGURATION
            modelBuilder.Entity<MaintenanceJob>()
                .HasMany(j => j.Technicians)
                .WithMany(t => t.MaintenanceJobs)
                .UsingEntity<Dictionary<string, object>>(
                    "MaintenanceJobTechnician",
                    j => j
                        .HasOne<Technician>()
                        .WithMany()
                        .HasForeignKey("TechnicianId")
                        .OnDelete(DeleteBehavior.Cascade),
                    t => t
                        .HasOne<MaintenanceJob>()
                        .WithMany()
                        .HasForeignKey("MaintenanceJobId")
                        .OnDelete(DeleteBehavior.Cascade)
                );
        }

        public override int SaveChanges()
        {
            UpdateTimestamps();
            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            UpdateTimestamps();
            return base.SaveChangesAsync(cancellationToken);
        }

        private void UpdateTimestamps()
        {
            var entries = ChangeTracker.Entries<MaintenanceJob>();
            var utcNow = DateTime.UtcNow;

            foreach (var entry in entries)
            {
                if (entry.State == EntityState.Added)
                {
                    // Always set timestamps for new entities, even if they were already set
                    entry.Entity.CreatedAt = utcNow;
                    entry.Entity.UpdatedAt = utcNow;
                }
                else if (entry.State == EntityState.Modified)
                {
                    // Only update UpdatedAt for modified entities, preserve CreatedAt
                    entry.Entity.UpdatedAt = utcNow;
                }
            }
        }
    }
}
