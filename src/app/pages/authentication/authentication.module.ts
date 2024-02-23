import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { RouterModule, Routes } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ForgotPasswordDialogComponent } from './forgot-password-dialog/forgot-password-dialog.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatToolbarModule} from '@angular/material/toolbar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthGuard } from '../../../Guards/auth.guard';



const routes : Routes = [
  {
    path : 'login',
    component : LoginComponent
  },
  {
    path : 'forgotpasswordDialog',
    component : ForgotPasswordDialogComponent
  },
  {
    path : '',
    redirectTo : 'login',
    pathMatch : 'full'
  }
];



@NgModule({
  declarations: [
    LoginComponent,
    ForgotPasswordDialogComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatToolbarModule,
    MatSnackBarModule,
  ]
})
export class AuthenticationModule { }
