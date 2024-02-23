import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { LoginService } from '../../../../Services/login.service';
import { CustomerService } from '../../../../Services/customer.service';
import { Router } from '@angular/router';
import { DashboardData, DashboardTable } from '../../../Models/Dashboard';
import { SelectionModel } from '@angular/cdk/collections';
import * as XLSX from 'xlsx';
import { FileSaverService } from '../../../../Services/file-saver.service';
import { CommonService } from '../../../../Services/common.service';
import { snackbarStatus } from '../../../Enums/notification-snackbar';
import { CommonSpinnerService } from '../../../../Services/common-spinner.service';
import { DatePipe } from '@angular/common';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'ngx-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {

  userDetails : any;
  displayedColumns : any[] = [];
  tableData : any [] =[];
  dashboardTable = new DashboardTable();
  showExport : boolean  = false;
  showDownload : boolean = false;
  activeCard : number = 0;
  pendingBtn : boolean = false;
  
  dataSource = new MatTableDataSource<DashboardData>();
  selection = new SelectionModel<any>(true, []);

@ViewChild(MatPaginator) paginator : MatPaginator;
@ViewChild(MatSort) sort: MatSort;


constructor(private _loginService : LoginService,
            private _customerService : CustomerService, 
            private _router : Router,
            private _fileSaver : FileSaverService, 
            private _CommonService : CommonService, 
            private _CommonSpinner : CommonSpinnerService, 
            private _datePipe : DatePipe){

 //this.dataSource = new MatTableDataSource();

 this.userDetails = _loginService.decryptToken(localStorage.getItem('Token'));


 if(this.userDetails.Role != 'A')
    {
      this.displayedColumns = [
        'TRACKING_NO',
        'INITIATED_DATE',
        'ITEM',
        'CUSTOMER_CODE',
        'CUSTOMER_NAME',
        'CONTI_PART_NUMBER',
        'CUSTOMER_PART_NUMBER',
        'STATUS',
        'USER',
        'REVIEW',
      ];

      this.showExport = true;

    }
    else
    {
      this.displayedColumns = [
        'TRACKING_NO',
        'INITIATED_DATE',
        'ITEM',
        'CUSTOMER_CODE',
        'CUSTOMER_NAME',
        'CONTI_PART_NUMBER',
        'CUSTOMER_PART_NUMBER',
        'STATUS'
      ]
    }

    this.getMaterialStores();
    this.CardClicked(1);

}
/** Constructor End */

ngOnInit()
{

}

ngAfterViewInit(){
  this.dataSource.sort = this.sort;
  this.dataSource.paginator = this.paginator;
}

/** Get Method for Warranty Details */
getMaterialStores()
{
  this._customerService.getMaterialStoreDetails(this.userDetails.UserId).subscribe({
    next : (response) => 
    {
      if(response != null)
      {
        this.tableData = response;
        this.dataSource = new MatTableDataSource(this.tableData);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.getCount(this.tableData);
      }
    },error : (err) => {
      this._CommonService.openSnackbar(err, snackbarStatus.Danger);
    },
  })
}


CardClicked(cardnumber : number){
  this.pendingBtn = false;
  if(cardnumber == 2)
  {
    this.pendingBtn = true;
  }
  this.activeCard = cardnumber;
}

 /** Whether the number of selected elements matches the total number of rows. */
 isAllSelected() {
  const numSelected = this.selection.selected.length;
  const numRows = this.dataSource.data.length;
  return numSelected === numRows;
}

/** Selects all rows if they are not all selected; otherwise clear selection. */
masterToggle() {
  this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
}

/** The label for the checkbox on the passed row */
checkboxLabel(row?: any): string {
  if (!row) {
    return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
  }
  return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
}

/** Select the Tracking Numbers */
selectTrackingNo()
{

  this.CardClicked(3);

  this.showExport = true;
  this.showDownload = true;

  this.displayedColumns = [
    'SELECET',
    'TRACKING_NO',
    'INITIATED_DATE',
    'ITEM',
    'CUSTOMER_CODE',
    'CUSTOMER_NAME',
    'CONTI_PART_NUMBER',
    'CUSTOMER_PART_NUMBER',
    'STATUS',
    'USER',
    'REVIEW',
  ];

  var data = [];
  this.tableData.forEach(element => {
    if(element.Status == "Completed")
    {
      data.push(element);
    }
  });

  this.dataSource = new MatTableDataSource(data);
  this.dataSource.sort = this.sort;
  this.dataSource.paginator = this.paginator;
}

/** Download the Excel Format based on the selected Tracking Numbers */
download()
{
  if(this.selection.selected.length > 0)
  {

    this._CommonSpinner.showSpinner();
    this.showExport = true;

    var selectedTrackingNo : number [] = [];
    this.selection.selected.forEach(element => {
      selectedTrackingNo.push(element.TrackingNo);
    });

    this._customerService.downloadExcel(selectedTrackingNo).subscribe({
      next : async (response) => 
      {
        this._CommonSpinner.hideSpinner();
        await this._fileSaver.downloadFile(response);
      },error : (err) => {
        this._CommonSpinner.hideSpinner();
        this._CommonService.openSnackbar(err, snackbarStatus.Danger);
      },
    })


  this.displayedColumns = [
    'TRACKING_NO',
    'INITIATED_DATE',
    'ITEM',
    'CUSTOMER_CODE',
    'CUSTOMER_NAME',
    'CONTI_PART_NUMBER',
    'CUSTOMER_PART_NUMBER',
    'STATUS',
    'USER',
    'REVIEW',
  ];

  this.selection.clear();
  this.showDownload = false;

  this.dataSource = new MatTableDataSource(this.tableData);
  this.dataSource.sort = this.sort;
  this.dataSource.paginator = this.paginator;

  }
  else
  {
    this._CommonService.openSnackbar("Selected Tracking No has been Download", snackbarStatus.Warning);
  }
}

/** Cancel the Downloading */
cancelDownload()
{
  this.displayedColumns = [
    'TRACKING_NO',
    'INITIATED_DATE',
    'ITEM',
    'CUSTOMER_CODE',
    'CUSTOMER_NAME',
    'CONTI_PART_NUMBER',
    'CUSTOMER_PART_NUMBER',
    'STATUS',
    'USER',
    'REVIEW',
  ];

  this.CardClicked(1);

  this.selection.clear();
  this.showDownload = false;
  this.dataSource = new MatTableDataSource(this.tableData);
  this.dataSource.sort = this.sort;
  this.dataSource.paginator = this.paginator;
}

/** Download the Tracking Number based on the Pending Status */
pendingDownload()
{
    if(this.dashboardTable.pendingWarranty.length > 0)
    {
      this.dashboardTable.pendingWarranty.forEach(element => {
        element.InitiatedDate = this.changeDateFormat(element.InitiatedDate);
      });
      const workSheet = XLSX.utils.json_to_sheet(this.dashboardTable.pendingWarranty);
      const workBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workBook, workSheet, 'Sheet1');
      const fileName = 'Pending_Warranty_List.xlsx';
      XLSX.writeFile(workBook, fileName);
    }
    else
    {
      this._CommonService.openSnackbar("There is no pending Warranty", snackbarStatus.Danger);
    }
}




showStatus(data)
{
  this._router.navigate(['pages/warrantypages/approval'], { queryParams : { TrackingNo : data.TrackingNo } });
}



applyFilter(event: Event) {
  const filterValue = (event.target as HTMLInputElement).value;
  this.dataSource.filter = filterValue.trim().toLowerCase();
}


selectStatus(status)
{
  if(status == "All")
  {
    this.dataSource = new MatTableDataSource(this.dashboardTable.allWarranty);
  }
  if(status == "Pending")
  {
    this.dataSource = new MatTableDataSource(this.dashboardTable.pendingWarranty);
  }
  if(status == "Approve")
  {
    this.dataSource = new MatTableDataSource(this.dashboardTable.approvedWarranty);
  }
  if(status == "Reject")
  {
    this.dataSource = new MatTableDataSource(this.dashboardTable.rejectedWarranty);
  }
  if(status == "Completed")
  {
    this.dataSource = new MatTableDataSource(this.dashboardTable.completedWarranty);
  }
  this.dataSource.sort = this.sort;
  this.dataSource.paginator = this.paginator;
}

/** Review Particular Tracking No */
review(element)
{
  this._router.navigate(['pages/warrantypages/approval'], {queryParams : { TrackingNo : element.TrackingNo, Status : element.Status }});
}

/** Approve Particular Tracking No */
approve(trackingNo)
{
  this._router.navigate(['pages/warrantypages/approval'], {queryParams : { TrackingNo : trackingNo }});
}


/**  */
getCount(tableData)
{
    this.dashboardTable.allWarranty = tableData;
    if(this.userDetails.Role != "A")
    {
      tableData.forEach(element => {
        if(element.Status == "Pending")
        {
            this.dashboardTable.pendingWarranty.push(element);
        }
        else if(element.Status == "Completed")
        {
            this.dashboardTable.completedWarranty.push(element);
        }
        else if(element.Status == "Rejected")
        {
            this.dashboardTable.rejectedWarranty.push(element);
        }
      });
    }
    else
    {
      tableData.forEach(element => {
        if(element.Status == "Active")
        {
            this.dashboardTable.pendingWarranty.push(element);
        }
        else if(element.Status == "Approved")
        {
            this.dashboardTable.approvedWarranty.push(element);
        }
        else if(element.Status == "Rejected")
        {
            this.dashboardTable.rejectedWarranty.push(element);
        }
    });
    }
}


/** Change Format Date Method */
changeDateFormat(date) : string
{
  return this._datePipe.transform(date, 'dd/MM/yyyy');
}

}
