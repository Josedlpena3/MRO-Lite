import { Component, Input } from '@angular/core';
import { MaintenanceJobStatus } from '../../models/maintenance-job.model';

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.css']
})
export class StatusBadgeComponent {
  @Input() status: MaintenanceJobStatus = 'Pendiente';

  get label(): string {
    if (this.status === 'EnProceso') {
      return 'En proceso';
    }
    return this.status;
  }

  get badgeClass(): string {
    switch (this.status) {
      case 'Pendiente':
        return 'badge-pendiente';
      case 'EnProceso':
        return 'badge-proceso';
      case 'Completado':
        return 'badge-completado';
      default:
        return 'badge-neutral';
    }
  }
}
