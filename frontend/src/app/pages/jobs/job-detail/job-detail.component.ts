import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MaintenanceJob } from '../../../models/maintenance-job.model';
import { MaintenanceJobService } from '../../../services/maintenance-job.service';
import { TechnicianService } from '../../../services/technician.service';

@Component({
  selector: 'app-job-detail',
  templateUrl: './job-detail.component.html',
  styleUrls: ['./job-detail.component.css']
})
export class JobDetailComponent implements OnInit, OnDestroy {
  job: MaintenanceJob | null = null;
  technicianMap: Record<number, string> = {};

  private subscription = new Subscription();
  private jobId = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly jobService: MaintenanceJobService,
    private readonly technicianService: TechnicianService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.jobId = idParam ? Number(idParam) : 0;

    if (!this.jobId) {
      this.router.navigate(['/jobs']);
      return;
    }

    void this.jobService.loadJobs().then(() => {
      const found = this.jobService.getById(this.jobId);
      if (!found) {
        this.router.navigate(['/jobs']);
        return;
      }
      this.job = found;
    }).catch((error) => {
      console.error('Error al cargar trabajo', error);
    });

    void this.technicianService.loadTechnicians().catch((error) => {
      console.error('Error al cargar tecnicos', error);
    });

    this.subscription.add(
      this.technicianService.technicians$.subscribe((technicians) => {
        this.technicianMap = technicians.reduce<Record<number, string>>((acc, tech) => {
          acc[tech.id] = tech.name;
          return acc;
        }, {});
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onEdit(): void {
    if (!this.job) {
      return;
    }

    this.router.navigate(['/jobs', this.job.id, 'edit']);
  }

  onBack(): void {
    this.router.navigate(['/jobs']);
  }

  onDelete(): void {
    if (!this.job) {
      return;
    }

    const confirmed = window.confirm('Seguro que queres eliminar este trabajo?');
    if (!confirmed) {
      return;
    }

    void this.jobService.deleteJob(this.job.id).then(() => {
      this.router.navigate(['/jobs']);
    }).catch((error) => {
      console.error('Error al eliminar trabajo', error);
    });
  }

  getTechnicianLabel(id: number): string {
    const name = this.technicianMap[id];
    return name ? `${name} (ID: ${id})` : `ID: ${id}`;
  }
}
