import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Technician, TechnicianDraft } from '../models/technician.model';
import { environment } from '../../environments/environment';

interface TechnicianApi {
  id?: number;
  Id?: number;
  name?: string;
  Name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TechnicianService {
  private readonly techniciansSubject = new BehaviorSubject<Technician[]>([]);
  readonly technicians$ = this.techniciansSubject.asObservable();

  private readonly apiUrl = environment.apiUrl;
  private loaded = false;
  private loadingPromise: Promise<void> | null = null;

  constructor(private readonly http: HttpClient) {}

  async loadTechnicians(force = false): Promise<void> {
    if (this.loaded && !force) {
      return;
    }

    if (this.loadingPromise && !force) {
      return this.loadingPromise;
    }

    this.loadingPromise = (async () => {
      try {
        const response = await firstValueFrom(
          this.http.get<TechnicianApi[] | unknown>(`${this.apiUrl}/technicians`)
        );
        const raw = Array.isArray(response) ? response : [];
        const technicians = raw
          .map((tech) => this.normalizeTechnician(tech))
          .filter((tech) => Number.isFinite(tech.id) && tech.id > 0);

        if (!Array.isArray(response)) {
          console.warn('[TechnicianService] Expected array response for technicians.', response);
        } else if (raw.length > 0 && technicians.length === 0) {
          console.warn('[TechnicianService] Empty mapping from API response.', raw[0]);
        }

        this.techniciansSubject.next(technicians);
        this.loaded = true;
      } catch (error) {
        console.error('[TechnicianService] Error loading technicians:', error);
        this.techniciansSubject.next([]);
        throw error;
      }
    })();

    try {
      await this.loadingPromise;
    } finally {
      this.loadingPromise = null;
    }
  }

  getSnapshot(): Technician[] {
    return this.techniciansSubject.value;
  }

  getById(id: number): Technician | undefined {
    return this.techniciansSubject.value.find((tech) => tech.id === id);
  }

  async createTechnician(draft: TechnicianDraft): Promise<Technician> {
    const created = await firstValueFrom(
      this.http.post<TechnicianApi>(`${this.apiUrl}/technicians`, draft)
    );
    const normalized = this.normalizeTechnician(created);
    this.techniciansSubject.next([normalized, ...this.techniciansSubject.value]);
    return normalized;
  }

  async updateTechnician(id: number, draft: TechnicianDraft): Promise<Technician | null> {
    await firstValueFrom(this.http.put<void>(`${this.apiUrl}/technicians/${id}`, draft));

    const technicians = this.techniciansSubject.value;
    const existing = technicians.find((tech) => tech.id === id);
    if (!existing) {
      await this.loadTechnicians(true);
      return this.getById(id) ?? null;
    }

    const updated: Technician = { ...existing, ...draft, id };
    this.techniciansSubject.next(technicians.map((tech) => (tech.id === id ? updated : tech)));
    return updated;
  }

  async deleteTechnician(id: number): Promise<boolean> {
    await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/technicians/${id}`));

    const technicians = this.techniciansSubject.value;
    this.techniciansSubject.next(technicians.filter((tech) => tech.id !== id));
    return true;
  }

  private normalizeTechnician(raw: TechnicianApi): Technician {
    const id = Number(raw.id ?? raw.Id ?? 0);
    const name = (raw.name ?? raw.Name ?? '').toString();
    return { id, name };
  }
}
