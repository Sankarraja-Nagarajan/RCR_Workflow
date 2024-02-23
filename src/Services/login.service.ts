import { Injectable } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { Observable, Subject } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  userName$ = new Subject();

  constructor(private _httpService : HttpService, private toastrService: NbToastrService) { }

  getUserName(userName)
  {
    this.userName$.next(userName);
  }

  decryptToken(token)
  {
    const helper = new JwtHelperService();
    const decodedToken = helper.decodeToken(token);
    return decodedToken;
  }

  isLogin()
  {
    return !!localStorage.getItem('Token');
  }

  getPasswordValidity(userId) : Promise<any>
  {
    return this._httpService.get(`Authentication/GetPasswordValidity?userId=${userId}`).toPromise();
  }

  authentication(authUser) : Observable<any>
  {
    const URL = 'Authentication/Authentication';
    return this._httpService.post(URL, authUser);
  }

  checkUser(userId) : Observable<any>
  {
    return this._httpService.get(`Authentication/CheckUser?userId=${userId}`);
  }

  sendMailToGenerateOtp(userMail) : Observable<any>
  {
    const URL = 'Authentication/GenerateOtp';
    return this._httpService.post(URL, userMail);
  }

  confirmOtp(userId, otp) : Observable<any>
  {
    const URL = `Authentication/ConfirmOtp?userId=${userId}&otp=${otp}`;
    return this._httpService.get(URL);
  }

  changePassword(resetPassword) : Observable<any>
  {
    const URL = `Authentication/ForgotPassword`;
    return this._httpService.post(URL, resetPassword);
  }


}
