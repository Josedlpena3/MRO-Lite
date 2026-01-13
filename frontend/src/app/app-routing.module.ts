import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JobsListComponent } from './pages/jobs/jobs-list/jobs-list.component';
import { JobDetailComponent } from './pages/jobs/job-detail/job-detail.component';
import { JobEditComponent } from './pages/jobs/job-edit/job-edit.component';
import { TechniciansListComponent } from './pages/technicians/technicians-list/technicians-list.component';
import { TechnicianEditComponent } from './pages/technicians/technician-edit/technician-edit.component';
import { IndicatorsComponent } from './pages/indicators/indicators.component';

const routes: Routes = [
  { path: '', redirectTo: 'jobs', pathMatch: 'full' },
  { path: 'jobs', component: JobsListComponent },
  { path: 'jobs/new', component: JobEditComponent },
  { path: 'jobs/:id', component: JobDetailComponent },
  { path: 'jobs/:id/edit', component: JobEditComponent },
  { path: 'technicians', component: TechniciansListComponent },
  { path: 'technicians/new', component: TechnicianEditComponent },
  { path: 'technicians/:id/edit', component: TechnicianEditComponent },
  { path: 'indicators', component: IndicatorsComponent },
  { path: '**', redirectTo: 'jobs' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
