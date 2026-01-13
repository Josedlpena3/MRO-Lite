import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { JobFilter } from '../../models/maintenance-job.model';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.css']
})
export class FiltersComponent implements OnChanges {
  @Input() filters: JobFilter = {
    status: 'Todos',
    company: 'Todas',
    search: ''
  };
  @Input() companies: string[] = [];

  @Output() filtersChange = new EventEmitter<JobFilter>();
  @Output() clearFilters = new EventEmitter<void>();
  @Output() createJob = new EventEmitter<void>();

  localFilters: JobFilter = { ...this.filters };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters']) {
      this.localFilters = { ...this.filters };
    }
  }

  emitFilters(): void {
    this.filtersChange.emit({ ...this.localFilters });
  }
}
