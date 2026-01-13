import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Technician } from '../../../models/technician.model';
import { TechnicianService } from '../../../services/technician.service';

@Component({
  selector: 'app-technician-edit',
  templateUrl: './technician-edit.component.html',
  styleUrls: ['./technician-edit.component.css']
})
export class TechnicianEditComponent implements OnInit {
  technician: Technician | null = null;
  isEditMode = false;

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]]
  });

  private technicianId = 0;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly technicianService: TechnicianService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.technicianId = idParam ? Number(idParam) : 0;
    this.isEditMode = Boolean(this.technicianId);

    if (this.isEditMode) {
      void this.technicianService.loadTechnicians().then(() => {
        const found = this.technicianService.getById(this.technicianId);
        if (!found) {
          this.router.navigate(['/technicians']);
          return;
        }
        this.technician = found;
        this.form.reset({ name: found.name });
      }).catch((error) => {
        console.error('Error al cargar tecnico', error);
      });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    try {
      if (this.isEditMode && this.technician) {
        const updated = await this.technicianService.updateTechnician(this.technician.id, {
          name: value.name ?? ''
        });

        if (updated) {
          this.router.navigate(['/technicians']);
        }
        return;
      }

      await this.technicianService.createTechnician({
        name: value.name ?? ''
      });

      this.router.navigate(['/technicians']);
    } catch (error) {
      console.error('Error al guardar tecnico', error);
    }
  }

  onCancel(): void {
    this.router.navigate(['/technicians']);
  }

  onBack(): void {
    this.router.navigate(['/technicians']);
  }
}
