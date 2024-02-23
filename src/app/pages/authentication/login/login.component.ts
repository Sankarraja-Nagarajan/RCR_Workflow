import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ForgotPasswordDialogComponent } from '../forgot-password-dialog/forgot-password-dialog.component';
import { LoginService } from '../../../../Services/login.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ToasterService } from '../../../../Services/toaster.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonService } from '../../../../Services/common.service';
import { snackbarStatus } from '../../../Enums/notification-snackbar';
import { CommonSpinnerService } from '../../../../Services/common-spinner.service';

@Component({
  selector: 'ngx-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation : ViewEncapsulation.None
})
export class LoginComponent {
  loginForm:FormGroup;
  hide = true;
  expiryDate : number;

  constructor(private _formBuilder:FormBuilder, 
              private router:Router, 
              public _dialog: MatDialog, 
              private _loginService : LoginService, 
              private _router : Router, 
              private _commonService : CommonService, 
              private _commonSpinner : CommonSpinnerService){

    this.loginForm = this._formBuilder.group({
      UserId : ['',Validators.required],
      Password : ['',Validators.required]
    })

  }

  ngOnInit()
  {
    
    if(localStorage.getItem('Token'))
    {
      var token = this._loginService.decryptToken(localStorage.getItem('Token'));
      this._loginService.checkUser(token.UserId).subscribe({
        next : (response) =>
        {
          this._router.navigate(['/pages/warrantypages/dashboard'])
          // .then(() => 
          // {
          //   this._commonService.openSnackbar(`Welcome Back, ${token.Username}`, snackbarStatus.Success);
          // });
        },error : (err) => {
          this._router.navigate(['/pages/authentication/login'])
          this._commonService.openSnackbar(err, snackbarStatus.Danger);
        },
      })
    }

  }

  OpenForgotPasswordDialog(choice : string){
    this.loginForm.reset();
    const dialogRef = this._dialog.open(ForgotPasswordDialogComponent, {
      disableClose: true,
      backdropClass: 'userActivationDialog',
      data : choice,
    }).afterClosed()
    .subscribe((res) => {
      if(res == "Change Password")
      {
        this.OpenForgotPasswordDialog(res);
      }
      else if(res == "Forgot Password")
      {
        this.OpenForgotPasswordDialog(res);
      }
    });
  }


/** Login Method */
  login()
  {
    if(this.loginForm.valid)
    {
      this._commonSpinner.showSpinner();
      this._loginService.authentication(this.loginForm.value).subscribe({
        next : (response) => 
        {
          this._loginService.getPasswordValidity(this.loginForm.value.UserId).then(
            (data) => 
            {
              this.expiryDate = data;

              if(this.expiryDate < 90)
              {
                if(response.Status == 200)
                {
                  localStorage.setItem('Token', response.Token);
                  this._loginService.getUserName(response.Token);
                  this._commonSpinner.hideSpinner();
                  this._router.navigate(['/pages/warrantypages/dashboard']).then(() => 
                  {
                    this._commonService.openSnackbar(response.Message, snackbarStatus.Success);
                    if(this.expiryDate >= 85)
                    {
                      setTimeout(() =>
                      {
                        this._commonService.openSnackbar(`Password change required within next ${90 - this.expiryDate} days`, snackbarStatus.Warning);
                      },2500)
                    }
                  });
                }
              }
              else
              {
                this._commonSpinner.hideSpinner();
                this.loginForm.reset();
                this.OpenForgotPasswordDialog("Change Password");
              }

            }
          ).catch((err) => 
          {
            this._commonService.openSnackbar(err, snackbarStatus.Danger);
          })
        },error : (err) =>  {
          this._commonSpinner.hideSpinner();
          this._commonService.openSnackbar(err, snackbarStatus.Danger);
        },
      })
    }
    else
    {
      if(this.loginForm.controls.UserId.invalid && this.loginForm.controls.Password.invalid)
      {
        this._commonService.openSnackbar("Enter User Id, Password", snackbarStatus.Danger);
        this.loginForm.markAllAsTouched();
      }
      else if(this.loginForm.controls.UserId.invalid)
      {
        this._commonService.openSnackbar("Enter User Id", snackbarStatus.Danger);
        this.loginForm.controls.UserId.markAsTouched();
      }
      else if(this.loginForm.controls.Password.invalid)
      {
        this._commonService.openSnackbar("Enter Password", snackbarStatus.Danger);
        this.loginForm.controls.Password.markAsTouched();
      }
    }
  }

}
