import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar'

@Injectable({
  providedIn: 'root'
})
export class ToasterService {

  constructor(private __snackbar : MatSnackBar) { }

  showErrorMessage(message : string) : void 
  {
    this.__snackbar.open(message, 'close', {
      duration : 1000,
      panelClass : ['error-snackbar']
    })
  }

}
