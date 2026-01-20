import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { JobFilter, MaintenanceJob } from '../../../models/maintenance-job.model';
import { MaintenanceJobService } from '../../../services/maintenance-job.service';
import { TechnicianService } from '../../../services/technician.service';

@Component({
  selector: 'app-jobs-list',
  templateUrl: './jobs-list.component.html',
  styleUrls: ['./jobs-list.component.css']
})
export class JobsListComponent implements OnInit, OnDestroy {
  jobs: MaintenanceJob[] = [];
  filteredJobs: MaintenanceJob[] = [];
  companies: string[] = [];
  technicianMap: Record<number, string> = {};
  filters: JobFilter = {
    status: 'Todos',
    company: 'Todas',
    search: ''
  };

  private subscription = new Subscription();

  constructor(
    private readonly jobService: MaintenanceJobService,
    private readonly technicianService: TechnicianService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    void this.jobService.loadJobs().catch((error) => {
      console.error('Error al cargar trabajos', error);
    });

    void this.technicianService.loadTechnicians().catch((error) => {
      console.error('Error al cargar tecnicos', error);
    });

    this.subscription.add(
      this.jobService.jobs$.subscribe((jobs) => {
        this.jobs = jobs;
        this.updateCompanies();
        this.applyFilters();
      })
    );

    this.subscription.add(
      this.technicianService.technicians$.subscribe((technicians) => {
        this.technicianMap = technicians.reduce<Record<number, string>>((acc, tech) => {
          acc[tech.id] = tech.name;
          return acc;
        }, {});
        this.applyFilters();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onFilterChange(filters: JobFilter): void {
    this.filters = filters;
    this.applyFilters();
  }

  onClearFilters(): void {
    this.filters = {
      status: 'Todos',
      company: 'Todas',
      search: ''
    };
    this.applyFilters();
  }

  onViewJob(job: MaintenanceJob): void {
    this.router.navigate(['/jobs', job.id]);
  }

  onCreateJob(): void {
    this.router.navigate(['/jobs/new']);
  }

  onDeleteJob(job: MaintenanceJob): void {
    const confirmed = window.confirm('Seguro que queres eliminar este trabajo?');
    if (!confirmed) {
      return;
    }

    void this.jobService.deleteJob(job.id).catch((error) => {
      console.error('Error al eliminar trabajo', error);
    });
  }

  private updateCompanies(): void {
    const unique = new Set(this.jobs.map((job) => job.company));
    this.companies = Array.from(unique).sort();

    if (this.filters.company !== 'Todas' && !unique.has(this.filters.company)) {
      this.filters = { ...this.filters, company: 'Todas' };
    }
  }

  private applyFilters(): void {
    const search = this.filters.search.trim().toLowerCase();

    this.filteredJobs = this.jobs.filter((job) => {
      const matchesStatus = this.filters.status === 'Todos' || job.status === this.filters.status;
      const matchesCompany = this.filters.company === 'Todas' || job.company === this.filters.company;
      const technicianNames = job.technicianIds
        .map((id) => this.technicianMap[id])
        .filter(Boolean)
        .join(' ');

      const matchesSearch =
        !search ||
        [
          job.equipment,
          job.company,
          job.plane,
          job.notes ?? '',
          job.technicianIds.join(' '),
          technicianNames
        ]
          .join(' ')
          .toLowerCase()
          .includes(search);

      return matchesStatus && matchesCompany && matchesSearch;
    });
  }
}
