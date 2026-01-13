import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HeaderComponent } from './components/header/header.component';
import { FiltersComponent } from './components/filters/filters.component';
import { JobTableComponent } from './components/job-table/job-table.component';
import { JobCardsComponent } from './components/job-cards/job-cards.component';
import { JobFormComponent } from './components/job-form/job-form.component';
import { StatusBadgeComponent } from './components/status-badge/status-badge.component';
import { SummaryCardsComponent } from './components/summary-cards/summary-cards.component';
import { JobsListComponent } from './pages/jobs/jobs-list/jobs-list.component';
import { JobDetailComponent } from './pages/jobs/job-detail/job-detail.component';
import { JobEditComponent } from './pages/jobs/job-edit/job-edit.component';
import { TechniciansListComponent } from './pages/technicians/technicians-list/technicians-list.component';
import { TechnicianEditComponent } from './pages/technicians/technician-edit/technician-edit.component';
import { IndicatorsComponent } from './pages/indicators/indicators.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FiltersComponent,
    JobTableComponent,
    JobCardsComponent,
    JobFormComponent,
    StatusBadgeComponent,
    SummaryCardsComponent,
    JobsListComponent,
    JobDetailComponent,
    JobEditComponent,
    TechniciansListComponent,
    TechnicianEditComponent,
    IndicatorsComponent
  ],
  imports: [BrowserModule, FormsModule, ReactiveFormsModule, HttpClientModule, AppRoutingModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
