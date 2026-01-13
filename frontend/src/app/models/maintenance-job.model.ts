export type MaintenanceJobStatus = 'Pendiente' | 'EnProceso' | 'Completado';

export interface MaintenanceJob {
  id: number;
  equipment: string;
  company: string;
  plane: string;
  status: MaintenanceJobStatus;
  notes?: string;
  anomaly: boolean;
  anomalyComment?: string;
  createdAt: string;
  updatedAt: string;
  technicianIds: number[];
}

export interface JobFilter {
  status: MaintenanceJobStatus | 'Todos';
  company: string;
  search: string;
}

export interface JobDraft {
  equipment: string;
  company: string;
  plane: string;
  status: MaintenanceJobStatus;
  notes?: string;
  anomaly: boolean;
  anomalyComment?: string;
  technicianIds: number[];
}
