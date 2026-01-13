import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { JobDraft, MaintenanceJob, MaintenanceJobStatus } from '../../models/maintenance-job.model';
import { TechnicianService } from '../../services/technician.service';

@Component({
  selector: 'app-job-form',
  templateUrl: './job-form.component.html',
  styleUrls: ['./job-form.component.css']
})
export class JobFormComponent implements OnChanges, OnInit, OnDestroy {
  @Input() job: MaintenanceJob | null = null;
  @Input() isEditMode = false;
  @Output() saveJob = new EventEmitter<JobDraft>();
  @Output() cancel = new EventEmitter<void>();

  readonly statuses: MaintenanceJobStatus[] = ['Pendiente', 'EnProceso', 'Completado'];

  readonly form = this.fb.group({
    equipment: ['', Validators.required],
    company: ['', Validators.required],
    plane: ['', Validators.required],
    status: ['Pendiente' as MaintenanceJobStatus, Validators.required],
    technicianIds: this.fb.array<FormControl<number | null>>([]),
    anomaly: [false],
    anomalyComment: [''],
    notes: ['']
  });

  isNotesRequired = false;
  isAnomalyCommentRequired = false;
  technicianMap: Record<number, string> = {};

  private statusSubscription?: Subscription;
  private anomalySubscription?: Subscription;
  private technicianSubscription?: Subscription;

  constructor(
    private readonly fb: FormBuilder,
    private readonly technicianService: TechnicianService
  ) {}

  get technicianIds(): FormArray<FormControl<number | null>> {
    return this.form.get('technicianIds') as FormArray<FormControl<number | null>>;
  }

  get notesInvalid(): boolean {
    const control = this.form.controls.notes;
    return this.isNotesRequired && control.invalid;
  }

  get anomalyCommentInvalid(): boolean {
    const control = this.form.controls.anomalyComment;
    return this.isAnomalyCommentRequired && control.invalid;
  }

  ngOnInit(): void {
    void this.technicianService.loadTechnicians().catch((error) => {
      console.error('Error al cargar tecnicos', error);
    });

    this.statusSubscription = this.form.controls.status.valueChanges.subscribe((status) => {
      this.applyNotesRule((status as MaintenanceJobStatus) ?? 'Pendiente');
    });

    this.anomalySubscription = this.form.controls.anomaly.valueChanges.subscribe((value) => {
      this.applyAnomalyCommentRule(Boolean(value));
    });

    this.technicianSubscription = this.technicianService.technicians$.subscribe((technicians) => {
      this.technicianMap = technicians.reduce<Record<number, string>>((acc, tech) => {
        acc[tech.id] = tech.name;
        return acc;
      }, {});
    });

    this.applyNotesRule(this.form.controls.status.value as MaintenanceJobStatus);
    this.applyAnomalyCommentRule(Boolean(this.form.controls.anomaly.value));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['job']) {
      if (this.job) {
        this.form.reset({
          equipment: this.job.equipment,
          company: this.job.company,
          plane: this.job.plane,
          status: this.job.status,
          anomaly: this.job.anomaly,
          anomalyComment: this.job.anomalyComment ?? '',
          notes: this.job.notes ?? ''
        });
        this.setTechnicians(this.job.technicianIds);
      } else {
        this.form.reset({
          equipment: '',
          company: '',
          plane: '',
          status: 'Pendiente',
          anomaly: false,
          anomalyComment: '',
          notes: ''
        });
        this.technicianIds.clear();
      }

      this.applyNotesRule(this.form.controls.status.value as MaintenanceJobStatus);
      this.applyAnomalyCommentRule(Boolean(this.form.controls.anomaly.value));
    }
  }

  ngOnDestroy(): void {
    this.statusSubscription?.unsubscribe();
    this.anomalySubscription?.unsubscribe();
    this.technicianSubscription?.unsubscribe();
  }

  addTechnician(): void {
    this.technicianIds.push(this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]));
  }

  removeTechnician(index: number): void {
    this.technicianIds.removeAt(index);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.technicianIds.controls.forEach((control) => control.markAsTouched());
      return;
    }

    const value = this.form.getRawValue();
    const technicianIds = this.technicianIds.controls
      .map((control) => Number(control.value))
      .filter((item) => Number.isFinite(item) && item > 0);

    this.saveJob.emit({
      equipment: value.equipment ?? '',
      company: value.company ?? '',
      plane: value.plane ?? '',
      status: (value.status as MaintenanceJobStatus) ?? 'Pendiente',
      technicianIds,
      anomaly: Boolean(value.anomaly),
      anomalyComment: value.anomalyComment ?? '',
      notes: value.notes ?? ''
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  getTechnicianLabel(value: number | null): string {
    if (!value) {
      return '';
    }

    const name = this.technicianMap[value];
    return name ? `${name} (ID: ${value})` : `ID: ${value}`;
  }

  private setTechnicians(ids: number[]): void {
    this.technicianIds.clear();
    ids.forEach((id) => {
      this.technicianIds.push(this.fb.control<number | null>(id, [Validators.required, Validators.min(1)]));
    });
  }

  private applyNotesRule(status: MaintenanceJobStatus): void {
    const notesControl = this.form.controls.notes;
    this.isNotesRequired = status === 'Completado';

    if (this.isNotesRequired) {
      notesControl.setValidators([Validators.required]);
    } else {
      notesControl.clearValidators();
    }

    notesControl.updateValueAndValidity({ emitEvent: false });
  }

  private applyAnomalyCommentRule(isAnomaly: boolean): void {
    const commentControl = this.form.controls.anomalyComment;
    this.isAnomalyCommentRequired = isAnomaly;

    if (this.isAnomalyCommentRequired) {
      commentControl.setValidators([Validators.required]);
    } else {
      commentControl.clearValidators();
    }

    commentControl.updateValueAndValidity({ emitEvent: false });
  }
}
