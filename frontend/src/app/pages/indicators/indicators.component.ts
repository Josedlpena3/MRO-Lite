import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Subscription } from 'rxjs';
import { MaintenanceJob } from '../../models/maintenance-job.model';
import { Technician } from '../../models/technician.model';
import { MaintenanceJobService } from '../../services/maintenance-job.service';
import { TechnicianService } from '../../services/technician.service';

type TimeFilter = '7d' | '15d' | '30d' | '3m' | '6m' | '1y' | 'all';

interface IndicatorCard {
  label: string;
  value: string;
  helper: string;
  tone: 'total' | 'completed' | 'progress' | 'anomaly';
}

interface CompanyStat {
  name: string;
  percent: number;
  count: number;
}

@Component({
  selector: 'app-indicators',
  templateUrl: './indicators.component.html',
  styleUrls: ['./indicators.component.css']
})
export class IndicatorsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('statusChart') statusChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('anomalyChart') anomalyChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('technicianChart') technicianChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('companyChart') companyChartRef?: ElementRef<HTMLCanvasElement>;

  readonly timeOptions: { value: TimeFilter; label: string }[] = [
    { value: '7d', label: '7 dias' },
    { value: '15d', label: '15 dias' },
    { value: '30d', label: '30 dias' },
    { value: '3m', label: '3 meses' },
    { value: '6m', label: '6 meses' },
    { value: '1y', label: '1 año' },
    { value: 'all', label: 'Siempre' }
  ];

  timeFilter: TimeFilter = '7d';
  cards: IndicatorCard[] = [];
  hasData = false;
  technicianQuery = '';
  technicianMatches: Technician[] = [];
  selectedTechnician: Technician | null = null;
  technicianStats = {
    completed: 0,
    inProgress: 0,
    anomalies: 0,
    total: 0
  };
  companyStats: CompanyStat[] = [];

  private jobs: MaintenanceJob[] = [];
  private filteredJobs: MaintenanceJob[] = [];
  private technicians: Technician[] = [];
  private subscription = new Subscription();
  private statusChart?: Chart;
  private anomalyChart?: Chart;
  private technicianChart?: Chart;
  private companyChart?: Chart;

  private readonly statusColors = ['#cfd8e3', '#1b4c8c', '#1f9d6a'];
  private readonly anomalyColors = ['#f37b2d', '#1b4c8c'];
  private readonly technicianColors = ['#1b4c8c', '#f37b2d', '#c43f3f'];
  private readonly companyPalette = ['#1b4c8c', '#1d63c2', '#f37b2d', '#ffb377', '#0b1b3f', '#f5a156'];

  constructor(
    private readonly jobService: MaintenanceJobService,
    private readonly technicianService: TechnicianService
  ) {}

  ngOnInit(): void {
    Chart.register(...registerables);
    void this.jobService.loadJobs().catch((error) => {
      console.error('Error al cargar trabajos', error);
    });
    void this.technicianService.loadTechnicians().catch((error) => {
      console.error('Error al cargar tecnicos', error);
    });

    this.subscription.add(
      this.jobService.jobs$.subscribe((jobs) => {
        this.jobs = jobs;
        this.updateDashboard();
      })
    );

    this.subscription.add(
      this.technicianService.technicians$.subscribe((technicians) => {
        this.technicians = technicians;
        this.updateTechnicianMatches();
      })
    );
  }

  ngAfterViewInit(): void {
    this.renderStatusChart();
    this.renderAnomalyChart();
    this.renderTechnicianChart();
    this.renderCompanyChart();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.statusChart?.destroy();
    this.anomalyChart?.destroy();
    this.technicianChart?.destroy();
    this.companyChart?.destroy();
  }

  onTimeFilterChange(value: string): void {
    const option = this.timeOptions.find((item) => item.value === value);
    if (option) {
      this.setTimeFilter(option.value);
    }
  }

  setTimeFilter(filter: TimeFilter): void {
    if (this.timeFilter === filter) {
      return;
    }
    this.timeFilter = filter;
    this.updateDashboard();
  }

  onTechnicianQueryChange(value: string): void {
    this.technicianQuery = value;
    this.updateTechnicianMatches();
  }

  selectTechnician(technician: Technician): void {
    this.technicianQuery = technician.name;
    this.selectedTechnician = technician;
    this.technicianMatches = [technician];
    this.updateTechnicianIndicators();
  }

  getCompanyColor(index: number): string {
    return this.companyPalette[index % this.companyPalette.length];
  }

  get periodLabel(): string {
    switch (this.timeFilter) {
      case '7d':
        return 'Ultimos 7 dias';
      case '15d':
        return 'Ultimos 15 dias';
      case '30d':
        return 'Ultimos 30 dias';
      case '3m':
        return 'Ultimos 3 meses';
      case '6m':
        return 'Ultimos 6 meses';
      case '1y':
        return 'Ultimo ano';
      case 'all':
        return 'Siempre';
      default:
        return 'Ultimos 7 dias';
    }
  }

  private updateDashboard(): void {
    this.filteredJobs = this.applyTimeFilter(this.jobs);
    this.hasData = this.filteredJobs.length > 0;
    this.cards = this.buildCards(this.filteredJobs);
    this.updateCompanyIndicators();
    this.updateTechnicianIndicators();
    this.renderStatusChart();
    this.renderAnomalyChart();
    this.renderCompanyChart();
  }

  private applyTimeFilter(jobs: MaintenanceJob[]): MaintenanceJob[] {
    if (this.timeFilter === 'all') {
      return jobs;
    }

    const daysLookup: Record<Exclude<TimeFilter, 'all'>, number> = {
      '7d': 7,
      '15d': 15,
      '30d': 30,
      '3m': 90,
      '6m': 180,
      '1y': 365
    };

    const days = daysLookup[this.timeFilter];
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(now.getDate() - days);

    return jobs.filter((job) => {
      const timestamp = this.resolveJobDate(job);
      if (!timestamp) {
        return false;
      }
      return timestamp >= cutoff && timestamp <= now;
    });
  }

  private resolveJobDate(job: MaintenanceJob): Date | null {
    const created = new Date(job.createdAt);
    const updated = new Date(job.updatedAt);
    const createdTime = Number.isNaN(created.getTime()) ? null : created.getTime();
    const updatedTime = Number.isNaN(updated.getTime()) ? null : updated.getTime();

    if (createdTime === null && updatedTime === null) {
      return null;
    }

    const timestamp = Math.max(createdTime ?? 0, updatedTime ?? 0);
    return new Date(timestamp);
  }

  private buildCards(jobs: MaintenanceJob[]): IndicatorCard[] {
    const total = jobs.length;
    const completed = jobs.filter((job) => job.status === 'Completado').length;
    const inProgress = jobs.filter((job) => job.status === 'EnProceso').length;
    const anomalies = jobs.filter((job) => job.anomaly).length;

    const percent = (value: number) => (total ? Math.round((value / total) * 100) : 0);

    return [
      {
        label: 'Total de trabajos',
        value: String(total),
        helper: this.periodLabel,
        tone: 'total'
      },
      {
        label: '% completados',
        value: `${percent(completed)}%`,
        helper: `${completed} de ${total}`,
        tone: 'completed'
      },
      {
        label: '% en proceso',
        value: `${percent(inProgress)}%`,
        helper: `${inProgress} de ${total}`,
        tone: 'progress'
      },
      {
        label: '% con anomalias',
        value: `${percent(anomalies)}%`,
        helper: `${anomalies} de ${total}`,
        tone: 'anomaly'
      }
    ];
  }

  private updateTechnicianMatches(): void {
    const query = this.technicianQuery.trim().toLowerCase();

    if (!query) {
      this.technicianMatches = [];
      this.selectedTechnician = null;
      this.updateTechnicianIndicators();
      return;
    }

    const matches = this.technicians.filter((tech) =>
      tech.name.toLowerCase().includes(query)
    );

    const exactMatch = matches.find((tech) => tech.name.toLowerCase() === query);

    this.technicianMatches = matches;
    this.selectedTechnician = exactMatch ?? (matches.length === 1 ? matches[0] : null);
    this.updateTechnicianIndicators();
  }

  private updateTechnicianIndicators(): void {
    if (!this.selectedTechnician) {
      this.technicianStats = { completed: 0, inProgress: 0, anomalies: 0, total: 0 };
      this.renderTechnicianChart();
      return;
    }

    const related = this.filteredJobs.filter((job) =>
      job.technicianIds.includes(this.selectedTechnician?.id ?? 0)
    );

    const total = related.length;
    const completed = related.filter((job) => job.status === 'Completado').length;
    const inProgress = related.filter((job) => job.status === 'EnProceso').length;
    const anomalies = related.filter((job) => job.anomaly).length;

    const percent = (value: number) => (total ? Math.round((value / total) * 100) : 0);

    this.technicianStats = {
      completed: percent(completed),
      inProgress: percent(inProgress),
      anomalies: percent(anomalies),
      total
    };
    this.renderTechnicianChart();
  }

  private updateCompanyIndicators(): void {
    const total = this.filteredJobs.length;
    const counter = this.filteredJobs.reduce<Record<string, number>>((acc, job) => {
      acc[job.company] = (acc[job.company] ?? 0) + 1;
      return acc;
    }, {});

    this.companyStats = Object.entries(counter)
      .map(([name, count]) => ({
        name,
        count,
        percent: total ? Math.round((count / total) * 100) : 0
      }))
      .sort((left, right) => right.percent - left.percent);
  }

  private renderStatusChart(): void {
    const canvas = this.statusChartRef?.nativeElement;
    if (!canvas) {
      return;
    }

    const pending = this.filteredJobs.filter((job) => job.status === 'Pendiente').length;
    const inProgress = this.filteredJobs.filter((job) => job.status === 'EnProceso').length;
    const completed = this.filteredJobs.filter((job) => job.status === 'Completado').length;
    const data = [pending, inProgress, completed];
    const labels = ['Pendiente', 'En proceso', 'Completado'];

    if (this.statusChart) {
      this.statusChart.data.labels = labels;
      this.statusChart.data.datasets[0].data = data;
      this.statusChart.update();
      return;
    }

    this.statusChart = new Chart(canvas, {
      type: 'pie',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: this.statusColors
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  private renderAnomalyChart(): void {
    const canvas = this.anomalyChartRef?.nativeElement;
    if (!canvas) {
      return;
    }

    const anomalies = this.filteredJobs.filter((job) => job.anomaly).length;
    const normal = Math.max(this.filteredJobs.length - anomalies, 0);
    const data = [anomalies, normal];
    const labels = ['Con anomalias', 'Sin anomalias'];

    if (this.anomalyChart) {
      this.anomalyChart.data.labels = labels;
      this.anomalyChart.data.datasets[0].data = data;
      this.anomalyChart.update();
      return;
    }

    this.anomalyChart = new Chart(canvas, {
      type: 'pie',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: this.anomalyColors
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  private renderTechnicianChart(): void {
    const canvas = this.technicianChartRef?.nativeElement;
    if (!canvas) {
      return;
    }

    const data = [
      this.technicianStats.completed,
      this.technicianStats.inProgress,
      this.technicianStats.anomalies
    ];
    const labels = ['Completados', 'En proceso', 'Con anomalias'];

    if (this.technicianChart) {
      this.technicianChart.data.labels = labels;
      this.technicianChart.data.datasets[0].data = data;
      this.technicianChart.update();
      return;
    }

    this.technicianChart = new Chart(canvas, {
      type: 'pie',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: this.technicianColors
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  private renderCompanyChart(): void {
    const canvas = this.companyChartRef?.nativeElement;
    if (!canvas) {
      return;
    }

    const labels = this.companyStats.map((stat) => stat.name);
    const data = this.companyStats.map((stat) => stat.percent);
    const colors = labels.map((_, index) => this.companyPalette[index % this.companyPalette.length]);

    if (this.companyChart) {
      this.companyChart.data.labels = labels;
      this.companyChart.data.datasets[0].data = data;
      this.companyChart.data.datasets[0].backgroundColor = colors;
      this.companyChart.update();
      return;
    }

    this.companyChart = new Chart(canvas, {
      type: 'pie',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
}
