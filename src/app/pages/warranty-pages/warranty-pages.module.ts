import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApprovalPageComponent } from './approval-page/approval-page.component';
import { RouterModule, Routes } from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import { MatPaginatorModule} from '@angular/material/paginator';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { WarrantyComponent } from './warranty/warranty.component';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox'
import { AuthGuard } from '../../../Guards/auth.guard';
import { MatSortModule } from '@angular/material/sort';
import { TrackingDialogComponent } from './tracking-dialog/tracking-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ReportsComponent } from './reports/reports.component';
import { MatTooltipModule } from '@angular/material/tooltip';


const routes : Routes = [
  {
    path : 'approval',
    component : ApprovalPageComponent,
    canActivate : [AuthGuard]
  },
  {
    path : 'dashboard',
    component : DashboardComponent,
    canActivate : [AuthGuard]
  },
  {
    path : 'warranty',
    component : WarrantyComponent,
    canActivate : [AuthGuard]
  },
  {
    path : 'tracking-dialog',
    component : TrackingDialogComponent
  },
  {
    path : 'reports',
    component : ReportsComponent,
    canActivate : [AuthGuard]
  },
];


@NgModule({
  declarations: [
    ApprovalPageComponent,
    DashboardComponent,
    WarrantyComponent,
    TrackingDialogComponent,
    ReportsComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatRadioModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    MatCheckboxModule,
    MatSortModule,
    MatDialogModule,
    MatTooltipModule,
  ],
  providers : [{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
})
export class WarrantyPagesModule { }
