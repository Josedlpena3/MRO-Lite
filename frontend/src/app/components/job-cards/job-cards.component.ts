import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MaintenanceJob } from '../../models/maintenance-job.model';

@Component({
  selector: 'app-job-cards',
  templateUrl: './job-cards.component.html',
  styleUrls: ['./job-cards.component.css']
})
export class JobCardsComponent {
  @Input() jobs: MaintenanceJob[] = [];
  @Input() technicianMap: Record<number, string> = {};
  @Output() viewJob = new EventEmitter<MaintenanceJob>();
  @Output() deleteJob = new EventEmitter<MaintenanceJob>();

  trackById(index: number, job: MaintenanceJob): number {
    return job.id;
  }

  getTechnicians(job: MaintenanceJob): string {
    if (!job.technicianIds.length) {
      return 'Sin asignar';
    }

    return job.technicianIds
      .map((id) => {
        const name = this.technicianMap[id];
        return name ? `${name} (ID: ${id})` : `ID: ${id}`;
      })
      .join(', ');
  }

  getAnomalyComment(job: MaintenanceJob): string {
    const comment = (job.anomalyComment ?? job.notes ?? '').toString().trim();
    return comment || 'Sin comentario';
  }
}
