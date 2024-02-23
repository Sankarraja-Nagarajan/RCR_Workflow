import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { snackbarStatus } from '../app/Enums/notification-snackbar';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  horizontalPosition: MatSnackBarHorizontalPosition = "center";
  verticalPosition: MatSnackBarVerticalPosition = "bottom";

  constructor(private _snackbar: MatSnackBar) { }


  /** Open Snackbar notification */
  openSnackbar(
    message: string,
    status: snackbarStatus,
    duration: number = 2500
  ) {
    let config = {
      duration: duration,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass:
        status === snackbarStatus.Success
          ? "success"
          : status === snackbarStatus.Danger
          ? "danger"
          : status === snackbarStatus.Warning
          ? "warning"
          : "info",
    };
    this._snackbar.open(message, "", config);
  }


}
