import { Injectable } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  constructor(private _httpService : HttpService, private toastrService: NbToastrService) { }

  showToast(message: string, color: string, position) {
    this.toastrService.show('',
      message,
      { duration: 3000, status: color, position, icon: '' });
  }

  /** Dashboard Component */

  getMaterialStoreDetails(userId) : Observable<any>
  {
    const URL = `Customer/getMaterialStoreDetails?userId=${userId}`;
    return this._httpService.get(URL);
  }

  downloadExcel(trackingNo) : Observable<any>
  {
    const URL = `Customer/DownloadApprovedWarranty`;
    return this._httpService.post(URL, trackingNo);
  }





  getPlantDetails()
  {
    return this._httpService.get(`Customer/GetPlant`);
  }

  getPlantByContiPartNo(contiPartNo) : Promise<any>
  {
    const URL = `Customer/GetPlantByContiPartNo?contiPartNo=${contiPartNo}`;
    return this._httpService.get(URL).toPromise();
  }

  getContiPartDetails(customerPartNo, plant, sales) : Promise<any>
  {
    const URL = `Customer/GetContiPartDetails?customerPartNo=${customerPartNo}&plant=${plant}&sales=${sales}`;
    return this._httpService.get(URL).toPromise();
  }

  getCustomersDetails(customerPartNo, contiPartNo) : Observable<any>
  {
    const URL = `Customer/GetCustomerDetails?customerPartNo=${customerPartNo}&contiPartNo=${contiPartNo}`;
    return this._httpService.get(URL);
  }

  getMaterialDetails(plant, contiPartNo) : Promise<any>
  {
    const URL = `Customer/GetMaterialDetails?plant=${plant}&contiPartNo=${contiPartNo}`;
    return this._httpService.get(URL).toPromise();
  }

  getFirstApproval() : Observable<any>
  {
    const URL = `Customer/GetFirstAprroval`;
    return this._httpService.get(URL);
  }

  getFirstApproverWithMaterial(plant, profitCenter, segment, subSegment, documentType) : Observable<any>
  {
    const URL = `Customer/GetFirstApproverWithMaterial?plant=${plant}&profitCenter=${profitCenter}&segment=${segment}&subSegment=${subSegment}&documentType=${documentType}`;
    return this._httpService.get(URL);
  }

  getTrackingNo() : Observable<any>
  {
    const URL = `Customer/GetTrackingNo`;
    return this._httpService.get(URL);
  }

  saveMaterial(materialDto) : Observable<any>
  {
    const URL = `Customer/SaveMaterial`;
    return this._httpService.postFile(URL, materialDto);
  }

  updateMaterial(materialDto) : Observable<any>
  {
    const URL = `Customer/UpdateMaterial`;
    return this._httpService.postFile(URL, materialDto);
  }

  saveUploadDocument(formData) : Observable<any>
  {
    const URL = `Customer/SaveUploadDocument`;
    return this._httpService.postFile(URL, formData);
  }

  updateUploadDocument(formData) : Observable<any>
  {
    const URL = `Customer/updateDocument`;
    return this._httpService.postFile(URL, formData);
  }

  getApproveMaterials(trackingNo) : Observable<any>
  {
    const URL = `Customer/GetApproveMaterial?trackingNo=${trackingNo}`;
    return this._httpService.get(URL);
  }

  getApprovalUser(trackingNo) : Observable<any>
  {
    const URL = `Customer/getApprovalUser?trackingNo=${trackingNo}`;
    return this._httpService.get(URL);
  }

  getApprovalDocument(trackingNo) : Observable<any>
  {
    const URL = `Customer/GetApprovalDocument?trackingNo=${trackingNo}`;
    return this._httpService.get(URL);
  }

  approveMaterial(approve) : Observable<any>
  {
    const URL = `Customer/ApproveMaterial/?approve=${approve}`;
    return this._httpService.put(URL, approve);
  }

  rejectMaterial(trackingNo, userId, reason, comments) : Observable<any>
  {
    const URL = `Customer/RejectMaterial?trackingNo=${trackingNo}&userId=${userId}&reason=${reason}&comments=${comments}`;
    return this._httpService.delete(URL);
  }

  getUpdateApprover(trackingNo) : Observable<any>
  {
    const URL = `Customer/GetUpdateApproveUser?trackingNo=${trackingNo}`;
    return this._httpService.put(URL, trackingNo);
  }


}
