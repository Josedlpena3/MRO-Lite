import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { JobDraft, MaintenanceJob, MaintenanceJobStatus } from '../models/maintenance-job.model';
import { Technician } from '../models/technician.model';

interface TechnicianApi {
  id?: number;
  Id?: number;
  name?: string;
  Name?: string;
}

interface MaintenanceJobApi {
  id?: number;
  Id?: number;
  equipment?: string;
  Equipment?: string;
  company?: string;
  Company?: string;
  plane?: string;
  Plane?: string;
  status?: MaintenanceJobStatus;
  Status?: MaintenanceJobStatus;
  notes?: string | null;
  Notes?: string | null;
  anomaly?: boolean;
  Anomaly?: boolean;
  createdAt?: string;
  CreatedAt?: string;
  updatedAt?: string;
  UpdatedAt?: string;
  technicians?: TechnicianApi[];
  Technicians?: TechnicianApi[];
}

interface PagedResult<T> {
  page?: number;
  Page?: number;
  pageSize?: number;
  PageSize?: number;
  total?: number;
  Total?: number;
  items?: T[];
  Items?: T[];
}

@Injectable({
  providedIn: 'root'
})
export class MaintenanceJobService {
  private readonly jobsSubject = new BehaviorSubject<MaintenanceJob[]>([]);
  readonly jobs$ = this.jobsSubject.asObservable();

  private readonly apiUrl = '/api';
  private readonly pageSize = 100;
  private loaded = false;
  private loadingPromise: Promise<void> | null = null;

  constructor(private readonly http: HttpClient) {}

  async loadJobs(force = false): Promise<void> {
    if (this.loaded && !force) {
      return;
    }

    if (this.loadingPromise && !force) {
      return this.loadingPromise;
    }

    this.loadingPromise = (async () => {
      try {
        const jobs = await this.fetchAllJobs();
        this.jobsSubject.next(jobs);
        this.loaded = true;
      } catch (error) {
        console.error('[MaintenanceJobService] Error loading jobs:', error);
        this.jobsSubject.next([]);
        throw error;
      }
    })();

    try {
      await this.loadingPromise;
    } finally {
      this.loadingPromise = null;
    }
  }

  getSnapshot(): MaintenanceJob[] {
    return this.jobsSubject.value;
  }

  getById(id: number): MaintenanceJob | undefined {
    return this.jobsSubject.value.find((job) => job.id === id);
  }

  async createJob(draft: JobDraft): Promise<MaintenanceJob> {
    const payload = {
      equipment: draft.equipment,
      company: draft.company,
      plane: draft.plane,
      technicianIds: draft.technicianIds,
      status: draft.status,
      notes: draft.notes ?? null,
      anomaly: draft.anomaly
    };

    const created = await firstValueFrom(
      this.http.post<MaintenanceJobApi>(`${this.apiUrl}/maintenancejobs`, payload)
    );

    const mapped = {
      ...this.mapJob(created),
      anomalyComment: draft.anomalyComment ?? undefined
    };
    this.jobsSubject.next([mapped, ...this.jobsSubject.value]);
    return mapped;
  }

  async updateJob(id: number, draft: JobDraft): Promise<MaintenanceJob | null> {
    const payload = {
      equipment: draft.equipment,
      company: draft.company,
      plane: draft.plane,
      technicianIds: draft.technicianIds,
      status: draft.status,
      notes: draft.notes ?? null,
      anomaly: draft.anomaly
    };

    await firstValueFrom(this.http.put<void>(`${this.apiUrl}/maintenancejobs/${id}`, payload));
    return this.refreshJob(id, draft.anomalyComment ?? undefined);
  }

  async updateStatus(id: number, status: MaintenanceJobStatus): Promise<MaintenanceJob | null> {
    await firstValueFrom(
      this.http.patch<void>(`${this.apiUrl}/maintenancejobs/${id}/status`, { status })
    );
    return this.refreshJob(id);
  }

  async deleteJob(id: number): Promise<boolean> {
    await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/maintenancejobs/${id}`));
    const jobs = this.jobsSubject.value;
    this.jobsSubject.next(jobs.filter((job) => job.id !== id));
    return true;
  }

  private mapJob(dto: MaintenanceJobApi): MaintenanceJob {
    const technicians = (dto.technicians ?? dto.Technicians ?? []).map((tech) =>
      this.normalizeTechnician(tech)
    );
    const status = (dto.status ?? dto.Status ?? 'Pendiente') as MaintenanceJobStatus;

    return {
      id: Number(dto.id ?? dto.Id ?? 0),
      equipment: (dto.equipment ?? dto.Equipment ?? '').toString(),
      company: (dto.company ?? dto.Company ?? '').toString(),
      plane: (dto.plane ?? dto.Plane ?? '').toString(),
      status,
      notes: (dto.notes ?? dto.Notes ?? undefined) ?? undefined,
      anomaly: Boolean(dto.anomaly ?? dto.Anomaly ?? false),
      createdAt: (dto.createdAt ?? dto.CreatedAt ?? '').toString(),
      updatedAt: (dto.updatedAt ?? dto.UpdatedAt ?? '').toString(),
      technicianIds: technicians
        .map((tech) => tech.id)
        .filter((id) => Number.isFinite(id) && id > 0)
    };
  }

  private async fetchAllJobs(): Promise<MaintenanceJob[]> {
    const jobs: MaintenanceJob[] = [];
    let page = 1;
    let total = 0;

    do {
      const response = await firstValueFrom(
        this.http.get<PagedResult<MaintenanceJobApi> | unknown>(`${this.apiUrl}/maintenancejobs`, {
          params: {
            page: String(page),
            pageSize: String(this.pageSize),
            sortBy: 'createdAt',
            sortDir: 'desc'
          }
        })
      );

      const normalized = this.normalizePagedResult(response as PagedResult<MaintenanceJobApi>);
      if (!response || typeof response !== 'object') {
        console.warn('[MaintenanceJobService] Expected object response for jobs.', response);
      } else if (normalized.items.length === 0 && ((response as PagedResult<MaintenanceJobApi>).items ?? (response as PagedResult<MaintenanceJobApi>).Items)?.length) {
        console.warn('[MaintenanceJobService] Empty mapping from API response.', response);
      }
      total = normalized.total;
      jobs.push(...normalized.items.map((item) => this.mapJob(item)));
      page += 1;
    } while (jobs.length < total);

    return jobs;
  }

  private async refreshJob(id: number, anomalyCommentOverride?: string): Promise<MaintenanceJob | null> {
    try {
      const refreshed = await firstValueFrom(
        this.http.get<MaintenanceJobApi>(`${this.apiUrl}/maintenancejobs/${id}`)
      );
      const mapped = this.mapJob(refreshed);
      const existing = this.jobsSubject.value.find((job) => job.id === id);
      const finalComment =
        anomalyCommentOverride !== undefined ? anomalyCommentOverride : existing?.anomalyComment;
      const merged =
        finalComment !== undefined ? { ...mapped, anomalyComment: finalComment } : mapped;
      const jobs = this.jobsSubject.value;
      const exists = jobs.some((job) => job.id === id);
      const next = exists
        ? jobs.map((job) => (job.id === id ? merged : job))
        : [merged, ...jobs];
      this.jobsSubject.next(next);
      return merged;
    } catch (error) {
      return null;
    }
  }

  private normalizePagedResult(raw?: PagedResult<MaintenanceJobApi> | null): {
    total: number;
    items: MaintenanceJobApi[];
  } {
    const items = raw?.items ?? raw?.Items ?? [];
    const total = Number(raw?.total ?? raw?.Total ?? items.length ?? 0);
    return {
      total,
      items: Array.isArray(items) ? items : []
    };
  }

  private normalizeTechnician(raw: TechnicianApi): Technician {
    const id = Number(raw.id ?? raw.Id ?? 0);
    const name = (raw.name ?? raw.Name ?? '').toString();
    return { id, name };
  }
}
