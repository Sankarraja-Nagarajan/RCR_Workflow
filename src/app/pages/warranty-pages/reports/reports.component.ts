import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonService } from '../../../../Services/common.service';
import { snackbarStatus } from '../../../Enums/notification-snackbar';
import { ReportService } from '../../../../Services/report.service';
import { DatePipe } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { CommonSpinnerService } from '../../../../Services/common-spinner.service';

@Component({
  selector: 'ngx-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  encapsulation : ViewEncapsulation.None,
})
export class ReportsComponent {

  
  reportFormGroup : FormGroup;

  showTable : boolean = false;
  tableColumns : any [] = [];
  dataSource = new MatTableDataSource();
  tableData : any [] = [];
  changeDatefield : boolean = true;
  selectedDates: any[] = [];
  hoveredColumn: string | null = null;
  hoveredRow: number | null = null;


  trackToolTip = `<ul> <li>For single entry (eg: 1000)</li>
                  <li>For range provide '-' inbetween tracking id (eg: 1000-1010) </li>
                  <li>For multiple tracking id's use ',' between the tracking id (eg. 1000,1005)</li> </ul>`;


  constructor(private _fb : FormBuilder, 
              private _commonService : CommonService, 
              private _reportService : ReportService, 
              private _datePipe : DatePipe, 
              private _router : Router, 
              private _commonSpinnerService : CommonSpinnerService) {
    
    this.reportFormGroup = _fb.group({
      TrackingNo : '',
      CreatedFrom : '',
      CreatedTo : '',
      UserId : '',
      Plant : '',
      Status : 'All',
      Indicator : 'BO',
      CreatedParticularDate : '',
    })

  }


  dateChanged(date): void {
    if (date && date.value) {
      let formattedDate = this._datePipe.transform(date.value, "yyyy-MM-dd");
  
      // Check for duplicates before adding to the array
      if (!this.selectedDates.includes(formattedDate)) {
        this.selectedDates.push(formattedDate);
      } else {
        const snackbarMessage = 'Duplicate date: ' + formattedDate;
        this._commonService.openSnackbar(snackbarMessage, snackbarStatus.Info);
        // Handle duplicate date case if needed
      }
    }
    this.reportFormGroup.controls.CreatedParticularDate.reset();
  }

  removeParticularDate(i)
  {
    this.selectedDates.splice(i, 1);
  }


  changeDateFormatBtn()
  {
    this.selectedDates = [];
    this.reportFormGroup.controls.CreatedFrom.reset();
    this.reportFormGroup.controls.CreatedTo.reset();
    this.changeDatefield = !this.changeDatefield;
  }

  onColumnClick(column: string, element: any): void {
    // Check if the clicked column is the one you want (e.g., "Status")
    if (column === 'TrackingNo') {
        // Navigate to another page using the router
        this._router.navigate(['/pages/warrantypages/approval'], {queryParams : { TrackingNo : element.TrackingNo }}); // Update 'your-other-page' with your actual route
    }
}


  execute()
  {
    // const trackingFromValue = this.reportFormGroup.value.TrackingNo.trim();

    // if (!(trackingFromValue.includes('.')) && !(trackingFromValue.includes('/'))) {
    //   const hasHyphen = trackingFromValue.includes('-');
    //   const hasComma = trackingFromValue.includes(',');

    //   if (hasHyphen && !hasComma) 
    //   {
    //     const numberOfHyphens: number = (trackingFromValue.match(/-/g) || []).length;

    //     if (numberOfHyphens === 1) {
    //       const trackingNo: any[] = [trackingFromValue.split('-')];

    this._commonSpinnerService.showSpinner();
    this.dataSource = new MatTableDataSource();

    this.showTable = false;
    

      this._reportService.FilterTrackingId(this.reportFormGroup.value.TrackingNo, this._datePipe.transform(this.reportFormGroup.value.CreatedFrom, 'yyyy-MM-dd'), this._datePipe.transform(this.reportFormGroup.value.CreatedTo, 'yyyy-MM-dd'), this.reportFormGroup.value.Plant, this.reportFormGroup.value.UserId, this.selectedDates).subscribe({
        next : (response) => 
        {
          this._commonSpinnerService.hideSpinner();
          this.tableColumns = Object.keys(response[0]);
          this.showTable = true;
          this.tableData = [];


          const statusFilter = this.reportFormGroup.value.Status;
          const indicatorFilter = this.reportFormGroup.value.Indicator;

          this.tableData = response.filter(element => 
            (statusFilter === "All" || element.Status === statusFilter) && (indicatorFilter === "BO" || element.Type === indicatorFilter)
          );
          

          this.dataSource = new MatTableDataSource(this.tableData);
        },error : (err) => {
          this._commonSpinnerService.hideSpinner();
          this._commonService.openSnackbar(err, snackbarStatus.Danger);
        },
      });
    //     } else {
    //       this._commonService.openSnackbar("Enter only one hyphen-separated combination", snackbarStatus.Warning);
    //     }
    //   } 
    //   else if (hasComma && !hasHyphen) 
    //   {
    //     const trackingNo: any[] = [trackingFromValue.split(',')];
    //   } 
    //   else if (hasHyphen && hasComma) 
    //   {
    //     this._commonService.openSnackbar("Enter either hyphen-separated or comma-separated combination, not both", snackbarStatus.Warning);
    //   } else {
    //     const trackingNo: any[] = [trackingFromValue];
    //   }
    // } else {
    //   this._commonService.openSnackbar("Remove commas and slashes", snackbarStatus.Warning);
    // }
  }


  clear()
  {
    this.reportFormGroup.reset();
    this.reportFormGroup.controls.Indicator.patchValue('BO');
    this.reportFormGroup.controls.Status.patchValue('All');
    this.reportFormGroup.value.TrackingNo = '';
    this.reportFormGroup.value.Plant = '';
    this.reportFormGroup.value.UserId = '';
  }


  changeDateFormat(date)
  {
    return this._datePipe.transform(date, "dd-MM-yyyy");
  }



  getCellStyle(status: string): any {
    switch (status) {
      case 'Completed':
        return { color: 'green' };
      // case 'InProgress':
        // return { 'background-color': 'orange', color: 'black' };
      case 'Pending':
        return { color: 'blue' };
      case 'Rejected':
        return { color: 'red' };
      // Add more cases for other status values
      default:
        return {};
    }
  }

  setHoveredColumnAndRow(column: string, row: number) {
    this.hoveredColumn = column;
    this.hoveredRow = row;
  }

  clearHoveredColumnAndRow() {
    this.hoveredColumn = null;
    this.hoveredRow = null;
  }


}
