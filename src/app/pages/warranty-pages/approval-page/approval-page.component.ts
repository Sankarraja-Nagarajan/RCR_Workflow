import { Component, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { CustomerService } from '../../../../Services/customer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../../../../Services/login.service';
import { ApproveOrReject } from '../../../Models/approveOrReject';
import { FileSaverService } from '../../../../Services/file-saver.service';
import { CommonService } from '../../../../Services/common.service';
import { snackbarStatus } from '../../../Enums/notification-snackbar';
import { CommonSpinnerService } from '../../../../Services/common-spinner.service';
import { DatePipe } from '@angular/common';



@Component({
  selector: 'ngx-approval-page',
  templateUrl: './approval-page.component.html',
  styleUrls: ['./approval-page.component.scss']
})
export class ApprovalPageComponent {


displayedColumns = ['DocumentType',
                    'Attribution',
                    'CustomerPartNo',
                    'ContiPartNo',
                    'CustomerCode',
                    'CustomerName',
                    'ContiPlant',
                    'ProfitCenter',
                    'MaterialDescription',
                    'ContiSegment',
                    'ContiSubSegment',
                    'OEMPostReference',
                    'CarModel',
                    'Currency',
                    'DealerName',
                    'ProblemDescription',
                    'DealerLocation',
                    'Quantity',
                    'VIN',
                    'CQTSQN',
                    'ContiProductionDate',
                    'RepairDate',
                    'RegistrationDate',
                    'ReturnDate',
                    'Mileage',
                    'SaleValue',
                    'BaseClaimValue',
                    'Handling',
                    'LabourCost',
                    'RepairCost',
                    'ForwardingCost',
                    'SubletCost',
                    'ConsequentialCost',
                    'TotalClaimValue',
                    'TechnicalFactor',
                    'FinalClaimValue',
                    'Tax',
                    'DebitValue',
                    'Remarks',
                      ];


dataSource = new MatTableDataSource();
approveDataSource = new MatTableDataSource();
rejectDataSource = new MatTableDataSource();
trackingNo : any;
tableData : any [] = [];
approvalFormGroup : FormGroup;
rejectFormGroup : FormGroup;
userDetails : any;
rejection = ['Data Quality', 'Quantity Mismatch', 'Price Mismatch', 'Material Mismatch', 'Others, (Kindly provide the reason in commments)', 'Gate Entry Mismatch'];
approvedColumns : any[] = [];
rejectColumns : any[] = [];
rejectTable : any [] [];
showRejectTable : boolean = false;
editbtn : boolean = false;
firstApproval : string;
fileUrl : any;
showApprovebtn : boolean = true;
totalValue = 0;

@ViewChild(MatPaginator) paginator : MatPaginator;
ngAfterViewInit(){
    this.dataSource.paginator = this.paginator;
}


constructor(private _customerService : CustomerService, 
            private _router : Router, 
            private _fb : FormBuilder, 
            private _loginService : LoginService, 
            private _activatedRoute : ActivatedRoute, 
            private _fileSaver : FileSaverService, 
            private _commonService : CommonService, 
            private _commonSpinner : CommonSpinnerService, 
            private _datePipe : DatePipe){


  this.approvalFormGroup = _fb.group({
    trackingNo: '',
    contiSegment: "",
    contiSubSegment: "",
    customerCode : "",
    customerName : "",
    attribution: "",
    contiPlant: "",
    documentType: "",
    profitCenter: "",
    totalValue : "",

  })

  this.rejectFormGroup = _fb.group({
    reasonForRejection : ['', Validators.required],
    comments : ['', Validators.required],
  })



  if(localStorage.getItem('Token'))
  {
    this.userDetails = _loginService.decryptToken(localStorage.getItem('Token'));
  }

  this.rejectColumns = ['userId-col', 'role-col', 'userName-col', 'reason-col', 'comments-col', 'date-col'];

  this.approvedColumns = ['userId-col', 'role-col', 'userName-col', 'reason-col', 'comments-col', 'status-col', 'date-col'];


  // Query Params
  _activatedRoute.queryParams.subscribe({
    next : (data) =>
    {
      this.trackingNo = Number(data.TrackingNo);
      // if(data.Status == "Rejected")
      // {
      //   this.editbtn = true;
      // }
    }
  })

 if(this.trackingNo)
 {

  // Get Method for Approver Details
  _customerService.getApprovalUser(this.trackingNo).subscribe({
    next : (response) => 
    {
      var activeCount = 0;
      response.forEach(element => {
        if(element.Status == "Rejected")
        {
          this.editbtn = true;
        }
        if(element.Role == "CQM")
        {
          this.firstApproval = element.UserId;
        }
        if(element.Role == "QMPP")
        {
          this.firstApproval = element.UserName;
        }
        if(this.userDetails.Role != "IWO" && this.userDetails.Role != "IWM")
        {
            if(element.Status == "Active")
            {
              if(element.UserId == this.userDetails.UserId)
              {
                activeCount++;
              }
            }
        }
      });
      if(this.userDetails.Role != "IWO" && this.userDetails.Role != "IWM")
      {
        if(activeCount == 0)
        {
          this.showApprovebtn = false;
          //_router.navigate(['pages/warrantypages/dashboard']);
        }
        else
        {
          this.showApprovebtn = true;
        }
      }
      this.approveDataSource = new MatTableDataSource(response);
    }, error : (err) => {
      _commonService.openSnackbar(err, snackbarStatus.Danger);
    },
   })


   // Get Method for Material Line Items to approve
  _customerService.getApproveMaterials(this.trackingNo).subscribe({
    next : (response) => 
    {
      if(response)
      {
            this.tableData = response.materialStores;
            response.materialStores.forEach(element => {
              //this.totalValue = this.totalValue + element.DebitValue;
              this.totalValue = Math.round((this.totalValue + element.DebitValue) * 100) / 100;
            });
            var trackNo = this.tableData[0].TrackingNo;
            this.approvalFormGroup.controls.trackingNo.patchValue(trackNo);
            this.approvalFormGroup.controls.totalValue.patchValue(this.totalValue);
            this.dataSource = new MatTableDataSource(this.tableData);
      }
      if(response.rejectionHistories)
      {
        this.showRejectTable = true;
        this.rejectTable = response.rejectionHistories;
        this.rejectDataSource = new MatTableDataSource(this.rejectTable);
      }
    },error : (err) => {
      _commonService.openSnackbar(err, snackbarStatus.Danger);
    },
  })

 }
 else
 {
  _router.navigate(['/pages/warrantypages/dashboard'])
 }


}

// Get Method for Document
downloadAttachment()
{
this._commonSpinner.showSpinner();
this._customerService.getApprovalDocument(this.trackingNo).subscribe({
  next: async (data) =>{
    await this._fileSaver.downloadFile(data);
    this._commonSpinner.hideSpinner();
    this._commonService.openSnackbar("Attachment Download Successfully", snackbarStatus.Success);
  },
  error : (err) => {
    this._commonSpinner.hideSpinner();
    this._commonService.openSnackbar(err, snackbarStatus.Danger);
  }
 })
}


// Edit Method to Update the Warranty
edit()
{
  this._router.navigate(['/pages/warrantypages/warranty'], {queryParams : { trackingNo : this.trackingNo, firstApproval : this.firstApproval }})
}

// Approve Method
approve()
{
  this._commonSpinner.showSpinner();
  var approve = new ApproveOrReject();
  approve.TrackingNo = this.approvalFormGroup.value.trackingNo;
  approve.UserId = this.userDetails.UserId;
  approve.Reason = this.rejectFormGroup.value.reasonForRejection;
  approve.Comments = this.rejectFormGroup.value.comments;
  this._customerService.approveMaterial(approve).subscribe({
    next : (response) => 
    {
      localStorage.removeItem('TrackingNo');
      this._router.navigate(['/pages/warrantypages/dashboard']);
      this._commonSpinner.hideSpinner();
      this._commonService.openSnackbar(response.Message, snackbarStatus.Success);
    },error : (err) => {
      this._commonSpinner.hideSpinner();
      this._commonService.openSnackbar(err, snackbarStatus.Danger);
    },
  })
}


// Reject Method
reject()
{
  if(this.rejectFormGroup.valid)
  {
    this._commonSpinner.showSpinner();
    this._customerService.rejectMaterial(this.approvalFormGroup.value.trackingNo, this.userDetails.UserId, this.rejectFormGroup.value.reasonForRejection, this.rejectFormGroup.value.comments).subscribe({
      next : (response) => 
      {
        this._commonSpinner.hideSpinner();
        this._commonService.openSnackbar(response.Message, snackbarStatus.Success);
        this._router.navigate(['/pages/warrantypages/dashboard']);
      },error : (err) => {
        this._commonSpinner.hideSpinner();
        this._commonService.openSnackbar(err, snackbarStatus.Danger);
      },
    })
  }
  else
  {
    this.rejectFormGroup.markAllAsTouched();
    this._commonService.openSnackbar("Please fill Reason For Rejection", snackbarStatus.Danger);
  }
}


 // Change Date Format
 changeDateFormat(date)
 {
   return this._datePipe.transform(date, "dd/MM/yyyy");
 }

}
