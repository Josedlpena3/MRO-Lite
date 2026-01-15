import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Technician } from '../../../models/technician.model';
import { TechnicianService } from '../../../services/technician.service';

/**
 * Componente para listar y gestionar técnicos.
 * Muestra la lista de técnicos ordenados alfabéticamente.
 */
@Component({
  selector: 'app-technicians-list',
  templateUrl: './technicians-list.component.html',
  styleUrls: ['./technicians-list.component.css']
})
export class TechniciansListComponent implements OnInit, OnDestroy {
  technicians: Technician[] = [];

  private subscription = new Subscription();

  constructor(
    private readonly technicianService: TechnicianService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    // Cargar técnicos desde el servicio
    void this.technicianService.loadTechnicians().catch((error) => {
      console.error('Error al cargar tecnicos', error);
    });

    // Suscribirse a cambios en la lista de técnicos
    this.subscription.add(
      this.technicianService.technicians$.subscribe((technicians) => {
        // Ordenar alfabéticamente por nombre
        this.technicians = [...technicians].sort((left, right) =>
          left.name.localeCompare(right.name)
        );
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Navega al formulario de creación de técnico.
   */
  onCreate(): void {
    this.router.navigate(['/technicians/new']);
  }

  /**
   * Navega al formulario de edición de un técnico.
   */
  onEdit(technician: Technician): void {
    this.router.navigate(['/technicians', technician.id, 'edit']);
  }

  /**
   * Elimina un técnico después de confirmación.
   */
  onDelete(technician: Technician): void {
    const confirmed = window.confirm('Seguro que queres eliminar este trabajador?');
    if (!confirmed) {
      return;
    }

    void this.technicianService.deleteTechnician(technician.id).catch((error) => {
      console.error('Error al eliminar tecnico', error);
    });
  }
}
