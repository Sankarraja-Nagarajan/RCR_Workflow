import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class CommonSpinnerService {

  constructor(private _spinner : NgxSpinnerService) { }

  showSpinner() : void
  {
    this._spinner.show();
  }

  hideSpinner() : void
  {
    this._spinner.hide();
  }

}
