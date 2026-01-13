import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JobDraft, MaintenanceJob } from '../../../models/maintenance-job.model';
import { MaintenanceJobService } from '../../../services/maintenance-job.service';

@Component({
  selector: 'app-job-edit',
  templateUrl: './job-edit.component.html',
  styleUrls: ['./job-edit.component.css']
})
export class JobEditComponent implements OnInit {
  job: MaintenanceJob | null = null;
  isEditMode = false;

  private jobId = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly jobService: MaintenanceJobService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.jobId = idParam ? Number(idParam) : 0;
    this.isEditMode = Boolean(this.jobId);

    if (this.isEditMode) {
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
    }
  }

  async onSave(draft: JobDraft): Promise<void> {
    try {
      if (this.isEditMode && this.job) {
        const onlyStatusChange = this.isOnlyStatusChange(draft, this.job);
        const updated = onlyStatusChange
          ? await this.jobService.updateStatus(this.job.id, draft.status)
          : await this.jobService.updateJob(this.job.id, draft);

        if (updated) {
          this.router.navigate(['/jobs', updated.id]);
        }
        return;
      }

      if (this.isEditMode && !this.job) {
        return;
      }

      const created = await this.jobService.createJob(draft);
      this.router.navigate(['/jobs', created.id]);
    } catch (error) {
      console.error('Error al guardar trabajo', error);
    }
  }

  onBack(): void {
    this.router.navigate(['/jobs']);
  }

  onCancel(): void {
    if (this.isEditMode && this.job) {
      this.router.navigate(['/jobs', this.job.id]);
      return;
    }

    this.router.navigate(['/jobs']);
  }

  private isOnlyStatusChange(draft: JobDraft, job: MaintenanceJob): boolean {
    const sameTechnicians =
      draft.technicianIds.length === job.technicianIds.length &&
      draft.technicianIds.every((id) => job.technicianIds.includes(id));

    return (
      draft.status !== job.status &&
      draft.equipment === job.equipment &&
      draft.company === job.company &&
      draft.plane === job.plane &&
      draft.anomaly === job.anomaly &&
      (draft.anomalyComment ?? '') === (job.anomalyComment ?? '') &&
      (draft.notes ?? '') === (job.notes ?? '') &&
      sameTechnicians
    );
  }
}
