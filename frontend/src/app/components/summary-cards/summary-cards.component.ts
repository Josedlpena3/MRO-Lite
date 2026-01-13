import { Component, Input, OnChanges } from '@angular/core';
import { MaintenanceJob } from '../../models/maintenance-job.model';

@Component({
  selector: 'app-summary-cards',
  templateUrl: './summary-cards.component.html',
  styleUrls: ['./summary-cards.component.css']
})
export class SummaryCardsComponent implements OnChanges {
  @Input() jobs: MaintenanceJob[] = [];

  total = 0;
  pendientes = 0;
  enProceso = 0;
  completados = 0;

  ngOnChanges(): void {
    this.total = this.jobs.length;
    this.pendientes = this.jobs.filter((job) => job.status === 'Pendiente').length;
    this.enProceso = this.jobs.filter((job) => job.status === 'EnProceso').length;
    this.completados = this.jobs.filter((job) => job.status === 'Completado').length;
  }
}
