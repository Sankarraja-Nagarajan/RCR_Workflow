import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../../../../Services/login.service';
import { CommonService } from '../../../../Services/common.service';
import { snackbarStatus } from '../../../Enums/notification-snackbar';
import { CommonSpinnerService } from '../../../../Services/common-spinner.service';
import { DialogRef } from '@angular/cdk/dialog';
import { ChangePassword } from '../../../Models/ChangePassword';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'ngx-forgot-password-dialog',
  templateUrl: './forgot-password-dialog.component.html',
  styleUrls: ['./forgot-password-dialog.component.scss']
})
export class ForgotPasswordDialogComponent {
  ForgotPasswordForm : FormGroup;
  changePasswordGroup : FormGroup;
  userCredentialForm : FormGroup;
  showUserId : boolean;
  showOtp : Boolean;
  showPassword : Boolean;
  userId : string;

constructor(private _formbuilder:FormBuilder, 
            private _loginService : LoginService, 
            private _commonService : CommonService, 
            private _commonSpinner : CommonSpinnerService, 
            private _dialodRef : DialogRef, 
            @Inject(MAT_DIALOG_DATA) public data: any){


  // Reset Password Form Group
  this.changePasswordGroup = _formbuilder.group({
    newPassword : ['', [Validators.required, Validators.pattern("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{10,30}")]],
    confirmPassword : ['', Validators.required],
  })

}

ngOnInit()
{
  if(this.data == "Forgot Password")
  {

    this.ForgotPasswordForm = this._formbuilder.group({
      UserId : ['',Validators.required],
      Email : ['', [Validators.required, Validators.email]]
    })

    this.showUserId = true;
    this.showOtp = false;
    this.showPassword = false;
  }
  else if(this.data == "Change Password")
  {

    this.ForgotPasswordForm = this._formbuilder.group({
      UserId : ['',Validators.required],
      Password : ['', [Validators.required]]
    })

    this.showUserId = true;
  }
}

sendMail()
{
  if(this.ForgotPasswordForm.valid)
  {
    this.userId = this.ForgotPasswordForm.value.UserId;
    this._commonSpinner.showSpinner();
    this._loginService.sendMailToGenerateOtp(this.ForgotPasswordForm.value).subscribe({
      next : (response) =>
      {
        this.showUserId = false;
        this.showOtp = true;
        this.showPassword = false; 
        this._commonSpinner.hideSpinner();
        this._commonService.openSnackbar(response.Message, snackbarStatus.Success)
      },error : (err) => {
        this._commonSpinner.hideSpinner();
        this._commonService.openSnackbar(err, snackbarStatus.Danger);
      },
    })
  }
  else
  {
    if(this.ForgotPasswordForm.controls.Email.invalid && this.ForgotPasswordForm.controls.UserId.invalid)
    {
      this.ForgotPasswordForm.markAllAsTouched();
      this._commonService.openSnackbar("Enter UserId, Email", snackbarStatus.Danger);
    }
    else if(this.ForgotPasswordForm.controls.Email.invalid)
    {
      this.ForgotPasswordForm.controls.Email.markAsTouched();
      this._commonService.openSnackbar("Enter Email", snackbarStatus.Danger);
    }
    else if(this.ForgotPasswordForm.controls.UserId.invalid)
    {
      this.ForgotPasswordForm.controls.UserId.markAsTouched();
      this._commonService.openSnackbar("Enter User Id", snackbarStatus.Danger);
    }
  }
}

submit(otp)
{
  if(otp.trim() != "" && otp.trim() != null)
  {
    this._commonSpinner.showSpinner();
    this._loginService.confirmOtp(this.userId, otp).subscribe({
      next : (response) =>
      {
        if(response)
        {
          this._commonSpinner.hideSpinner();
          this._commonService.openSnackbar(response.Message, snackbarStatus.Success);
          this.showUserId = false;
          this.showOtp = false;
          this.showPassword = true;
        }
      },error : (err) => {
        this._commonSpinner.hideSpinner();
        this._commonService.openSnackbar(err, snackbarStatus.Danger);
      },
    });
  }
  else
  {
    this._commonService.openSnackbar("Enter Otp", snackbarStatus.Danger);
  }
}

save()
{
  if(this.changePasswordGroup.valid)
  {
    if(this.changePasswordGroup.value.newPassword == this.changePasswordGroup.value.confirmPassword)
    {
      this._commonSpinner.showSpinner();
      var changePassword = new ChangePassword();
      changePassword.UserId = this.userId;
      changePassword.Password = this.changePasswordGroup.value.newPassword;
      this._loginService.changePassword(changePassword).subscribe({
        next : (response) => 
        {
          if(response)
          {
            this._commonSpinner.hideSpinner();
            this._commonService.openSnackbar(response.Message, snackbarStatus.Success);
            this._dialodRef.close();
          }
        },error : (err) => {
          this._commonSpinner.hideSpinner();
          this._commonService.openSnackbar(err, snackbarStatus.Danger);
        },
      })
    }
    else
    {
      this._commonService.openSnackbar("Confirm Password not Match", snackbarStatus.Danger);
    }
  }
  else
  {
    if(this.changePasswordGroup.controls.newPassword.invalid && this.changePasswordGroup.controls.confirmPassword.invalid)
    {
      this.changePasswordGroup.markAllAsTouched();
      this._commonService.openSnackbar("Enter new, Confirm Password", snackbarStatus.Danger);
    }
    else if(this.changePasswordGroup.controls.newPassword.invalid) 
    {
      this.changePasswordGroup.controls.newPassword.touched;
      this._commonService.openSnackbar("Enter new Password", snackbarStatus.Danger);
    }
    else if(this.changePasswordGroup.controls.confirmPassword.invalid) 
    {
      this.changePasswordGroup.controls.confirmPassword.touched;
      this._commonService.openSnackbar("Enter Confirm Password", snackbarStatus.Danger);
    }
  }
}

confirm()
{
  if(this.ForgotPasswordForm.valid)
  {
    this._commonSpinner.showSpinner();
    this._loginService.authentication(this.ForgotPasswordForm.value).subscribe({
      next : (response) => 
      {
        this._commonSpinner.hideSpinner();
        this._commonService.openSnackbar("Verified Successfully", snackbarStatus.Success);
        this.userId = this.ForgotPasswordForm.value.UserId;
        this.showUserId = false;
        this.showPassword = true;
      },error : (err) => {
        this._commonSpinner.hideSpinner();
        this._commonService.openSnackbar(err, snackbarStatus.Danger);
      },
    })
  }
  else
  {
    if(this.ForgotPasswordForm.controls.Password.invalid && this.ForgotPasswordForm.controls.UserId.invalid)
    {
      this.ForgotPasswordForm.markAllAsTouched();
      this._commonService.openSnackbar("Enter User Id, Password", snackbarStatus.Danger);
    }
    else if(this.ForgotPasswordForm.controls.Password.invalid)
    {
      this.ForgotPasswordForm.controls.Password.markAsTouched();
      this._commonService.openSnackbar("Enter Password", snackbarStatus.Danger);
    }
    else if(this.ForgotPasswordForm.controls.UserId.invalid)
    {
      this.ForgotPasswordForm.controls.UserId.markAsTouched();
      this._commonService.openSnackbar("Enter User Id", snackbarStatus.Danger);
    }
  }
}

cancel()
{
  this._dialodRef.close(this.data);
}


}
