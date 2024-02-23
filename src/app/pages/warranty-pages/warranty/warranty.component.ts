import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerService } from '../../../../Services/customer.service';
import { MaterialAndRejection, MaterialDto } from '../../../Models/MaterialDto';
import * as XLSX from 'xlsx';
import { LoginService } from '../../../../Services/login.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { CommonService } from '../../../../Services/common.service';
import { snackbarStatus } from '../../../Enums/notification-snackbar';
import { CommonSpinnerService } from '../../../../Services/common-spinner.service';
import { UploadFile } from '../../../Models/uploadFile';
import { MatDialog } from '@angular/material/dialog';
import { TrackingDialogComponent } from '../tracking-dialog/tracking-dialog.component';

@Component({
  selector: 'ngx-warranty',
  templateUrl: './warranty.component.html',
  styleUrls: ['./warranty.component.scss'],
  encapsulation : ViewEncapsulation.None
})
export class WarrantyComponent {


  displayedColumns = [
                      'CustomerPartNo',
                      'ContiPartNo',
                      // 'ContiPlant',
                      // 'ProfitCenter',
                      'MaterialDescription',
                      // 'ContiSegment',
                      // 'ContiSubSegment',
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
                      'Remove'
                      ];

  requiredColumns = [
      'CustomerPartNo',
      'OemPostReference',
      'CarModel',
      'Currency',
      'DealerName',
      'ProblemDescription',
      'DealerLocation',
      'Quantity',
      'Vin',
      'CqtsQn',
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
      'TechnicalFactor',
      'Tax',
      'Remarks',
  ];
  
  dataSource : any = new MatTableDataSource();
  tableData : any[] = [];
  warrantyFormGroup : FormGroup;
  materialFormGroup : FormGroup;
  contiPartNo : any [] = [];
  firstApproval : any [] = [];
  filterapproval : any [] = [];
  customer : any;
  userDetails : any;
  index : number;
  files : any;
  withRadio : boolean;
  withOutRadio : boolean;

  months = ['Jan', 'Feb', 'Mar', 'April', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  trackingNo : Number;
  totalValue : Number = 0;

  customerNameList = [];

  showExecutebtn : boolean = true;
  showSaleOrder : boolean = false;

  materialAndReject : MaterialAndRejection;

  plantDetails : any [] = [];

  selectedPlant : any;


  @ViewChild(MatPaginator) paginator: MatPaginator;
  columns: string[];

  constructor(private _customerService : CustomerService,
              private _fb : FormBuilder, 
              private _loginService : LoginService, 
              private _router : Router,
              private _datePipe : DatePipe, 
              private _activateRoute : ActivatedRoute, 
              private _commonService : CommonService, 
              private _commonSpinner : CommonSpinnerService, 
              public _dialog: MatDialog)
  {


    // Warranty FormGroup
    this.warrantyFormGroup = _fb.group({
      TrackingNo : ['', Validators.required],
      FirstApproval : ['', Validators.required],
      DocumentType : ['', Validators.required],
      Attribution : ['ZWAR', Validators.required],
      CustomerCode : ['', Validators.required],
      CustomerName : ['', Validators.required],
      ClaimForMonth : ['', Validators.required],
      ClaimForYear : ['', Validators.required],
      SalesOrderNo : [''],
      Plant : ['', Validators.required],
      ProfitCenter : ['', Validators.required],
      Segment : '',
    })

    // Material Form Group
    this.materialFormGroup = _fb.group({
      items : _fb.array([])
    })

  }
  /** Constructor End */


  ngOnInit()
  {

    // Get Plant Details
    this.getPlantDetails();

    // Get Method for First Approval
    this.getFirstApprover();

    // Query Params for Get Tracking Number and First Approval
    this._activateRoute.queryParams.subscribe({
      next : (data) => 
      {
        if(data)
        {
          this.warrantyFormGroup.controls.TrackingNo.patchValue((Number)(data.trackingNo));
          this.trackingNo = (Number)(data.trackingNo);
          this.warrantyFormGroup.controls.FirstApproval.patchValue(data.firstApproval);
          this.showExecutebtn = false;
        }
      }
    })

    // Get Method for Auto Generate Tracking No
    if(!this.trackingNo)
    {
      this.getTrackingNo();
    }

    this.userDetails = this._loginService.decryptToken(localStorage.getItem('Token'));    // get Token from Local Storage

    if(this.userDetails.Role == "IWM")
    {
      this.withRadio = false;
      this.withOutRadio = true;
      this.warrantyFormGroup.controls.DocumentType.patchValue('WM');
      this.showSaleOrder = true;
    }
    else if(this.userDetails.Role == "IWO")
    {
      this.withRadio = true;
      this.withOutRadio = false;
      this.warrantyFormGroup.controls.DocumentType.patchValue('WO');
      this.showSaleOrder = false;
    }

    // Get Method for Material Details
    if(this.trackingNo)
    {
      this.getMaterialDetails();
    }

  }
  /** NgOninit End  */


  getPlantDetails()
  {
    this._customerService.getPlantDetails().subscribe({
      next : (response) => 
      {
        this.plantDetails = response;
      }, error : (err) => {
        this._commonService.openSnackbar(err, snackbarStatus.Danger);
      },
    });
  }


  // Change Method for Document Type
  changeDocumentType()
  {
    const itemsFormArray = this.materialFormGroup.get('items') as FormArray;
  
    // Clear all controls in the FormArray
    while (itemsFormArray.length !== 0) {
      itemsFormArray.removeAt(0);
    }

    this.warrantyFormGroup.controls.FirstApproval.reset();
    this.warrantyFormGroup.controls.CustomerName.reset();
    this.warrantyFormGroup.controls.CustomerCode.reset();
    this.warrantyFormGroup.controls.ClaimForMonth.reset();
    this.warrantyFormGroup.controls.ClaimForYear.reset();
    this.warrantyFormGroup.controls.Plant.reset();
    this.warrantyFormGroup.controls.ProfitCenter.reset();
    this.warrantyFormGroup.controls.Segment.reset();
    this.customerNameList = [];
    this.tableData.splice(0);
    this.dataSource.data.splice(0);
    this.dataSource._updateChangeSubscription();
    this.totalValue = 0;

    const isWM = this.warrantyFormGroup.value.DocumentType === "WM";
    this.showSaleOrder = isWM;
  }

  // Get Material Details
  getMaterialDetails()
  {
    this._customerService.getApproveMaterials(this.trackingNo).subscribe((response)=>{
      if(response)
        {
              this.tableData = response.materialStores;
              var total = 0;
              response.materialStores.forEach(element => {
                total = total + element.debitValue;
              });

              this.tableData.forEach((element, index) => {
                this.getValidDate(element);
                const addRow = this.materialFormGroup.get('items') as FormArray;
                var obj = this.getFormFields(element);
                addRow.push(obj);
                this.dataSource.data.push(obj.value);
                this.dataSource._updateChangeSubscription();

                element.TotalClaimValue = element.BaseClaimValue + 
                              element.Handling + 
                              element.LabourCost + 
                              element.RepairCost + 
                              element.ForwardingCost + 
                              element.SubletCost + 
                              element.ConsequentialCost;

                element.FinalClaimValue = element.TotalClaimValue;
                element.DebitValue = element.Tax + element.FinalClaimValue;
                this.totalValue = Math.round((this.totalValue + element.DebitValue) * 100) / 100;
              });

              this.warrantyFormGroup.controls.CustomerName.patchValue(this.tableData[0].CustomerName);
              this.warrantyFormGroup.controls.CustomerCode.patchValue(this.tableData[0].CustomerCode);
              this.warrantyFormGroup.controls.DocumentType.patchValue(this.tableData[0].DocumentType);
              this.warrantyFormGroup.controls.Attribution.patchValue(this.tableData[0].Attribution);
              this.warrantyFormGroup.controls.ClaimForMonth.patchValue(response.ClaimForMonth);
              this.warrantyFormGroup.controls.ClaimForYear.patchValue(response.ClaimForYear);
              if(this.warrantyFormGroup.value.DocumentType == "WM")
              {
                this.showSaleOrder = true;
                if(this.tableData[0].SalesOrderNo)
                {
                  this.warrantyFormGroup.controls.SalesOrderNo.patchValue(this.tableData[0].SalesOrderNo);
                }
              }
              else
              {
                
              }
        }
    },err=>{
      this._commonService.openSnackbar(err, snackbarStatus.Danger);
    })

  }

  // Get Method for Tracking No
  getTrackingNo()
  {
    this._customerService.getTrackingNo().subscribe({
      next : (response) => 
      {
        this.warrantyFormGroup.controls.TrackingNo.patchValue(response);
        this.showExecutebtn = true;
      }
    })
  }

  // Get Method for First Approvals Details
  getFirstApprover()
  {
    this._customerService.getFirstApproval().subscribe({
      next : (response) => 
      {
        this.firstApproval = response;
        this.filterapproval = response;
      }
      })
  }

  // Get Method for Wit Material First Approver
  getfirstApproverWithMaterial(index)
  {
    this._customerService.getFirstApproverWithMaterial(this.materialFormGroup.controls.items.value[index].ContiPlant,
                                                       this.materialFormGroup.controls.items.value[index].ProfitCenter, 
                                                       this.materialFormGroup.controls.items.value[index].ContiSegment, 
                                                       this.materialFormGroup.controls.items.value[index].ContiSubSegment, 
                                                       this.warrantyFormGroup.value.DocumentType).subscribe({
      next : (response) => 
      {
        this.warrantyFormGroup.controls.FirstApproval.patchValue(response.Approver);
      },error : (err) => {
        this._commonService.openSnackbar(err, snackbarStatus.Danger);
      },
    })
  }


  onCustomerCodeChange(event)
  {
    var customer = this.customerNameList.find(cust => cust.CustomerCode == event.value);
    this.warrantyFormGroup.controls.CustomerName.patchValue(customer.CustomerName);
  }

  onCustomerNameChange(event)
  {
    var customer = this.customerNameList.find(cust => cust.CustomerName == event.value);
    this.warrantyFormGroup.controls.CustomerCode.patchValue(customer.CustomerCode);
  }


  // Get Method for Conti Material No
  searchCustomerPartNo(i)
  {
    this.getContiPartNo(i);
  }

  // Search Method for Conti Part Number based on Customer Part Number
  getContiPartNo(i)
  {
    if(this.warrantyFormGroup.controls.Plant.valid)
    {
      this.selectedPlant = this.getSelectedPlant(this.warrantyFormGroup.value.Plant);
      if(this.materialFormGroup.controls.items.value[i].CustomerPartNo != null && this.materialFormGroup.controls.items.value[i].CustomerPartNo != "")
      {
        this._customerService.getContiPartDetails(this.materialFormGroup.controls.items.value[i].CustomerPartNo, this.selectedPlant.Plant, this.selectedPlant.SalesOrganization).then(
          (response) => 
          {
            var ContiPartNoList = [];
            response.forEach(element => {
              ContiPartNoList.push(element);
            });
            var array = this.materialFormGroup.get('items') as FormArray;
            array.controls[i].get('ContiPartNo').reset();

            delete this.dataSource.data[i].ContiPartNoList;
            this.dataSource._updateChangeSubscription();
            if(ContiPartNoList.length == 1)
            {
              array.controls[i].get('ContiPartNo').patchValue(response[0]);
              //this.getPlant(i);
              this.getMaterial(i);
              //this.getCustomer(i);
            }
            else
            {
              this.dataSource.data[i].ContiPartNoList = ContiPartNoList;
              this.dataSource._updateChangeSubscription();
            }
          }
        ).catch((err) => {
          this._commonService.openSnackbar(err, snackbarStatus.Danger);
        });
      }
      else
      {
        this._commonService.openSnackbar("Enter Customer Part No", snackbarStatus.Danger);
      }
    }
    else
    {
      this._commonService.openSnackbar("Please fill plant field", snackbarStatus.Danger);
    }
  }

  getFormArray(index)
  {
    var array = this.materialFormGroup.get('items') as FormArray;
    return array.controls[index];
  }

  // Get Method for Conti Plant
  searchContiPartNo(index)
  {    
    //this.getPlant(index);
    this.getMaterial(index);
  }

  // Get Method for Material Details
  searchMaterialByPlant(index)
  {
    this.getMaterial(index);
  }

  // Get Method for Profit Center, Segment, Sub Segment
  getPlant(index)
  {
    if(this.materialFormGroup.controls.items.value[index].ContiPartNo != null && this.materialFormGroup.controls.items.value[index].ContiPartNo != "")
    {
      this._customerService.getPlantByContiPartNo(this.materialFormGroup.controls.items.value[index].ContiPartNo).then(
        (response) => 
        {
          var ContiPlantList = [];
          response.forEach(element => {
            ContiPlantList.push(element);
          });
          var array = this.materialFormGroup.get('items') as FormArray;
          array.controls[index].get('ContiPlant').reset();
          
          delete this.dataSource.data[index].ContiPlantList;
          this.dataSource._updateChangeSubscription();
          this.getCustomer();
          if(ContiPlantList.length == 1)
          {
            array.controls[index].get('ContiPlant').patchValue(response[0]);
            this.getMaterial(index);
            //this.getCustomer(index);
          }
          else
          {
            this.dataSource.data[index].ContiPlantList = ContiPlantList;
            this.dataSource._updateChangeSubscription();
          }
        }
      ).catch((err) => 
      {
        this._commonService.openSnackbar(err, snackbarStatus.Danger);
      })
    }
    else
    {
      this._commonService.openSnackbar("Enter Conti part No", snackbarStatus.Danger);
    }
  }

  // Get Method for warranty line items based on Conti Part Number
  getMaterial(index)
  {
    //if(this.materialFormGroup.controls.items.value[index].ContiPlant != null && 
     //  this.materialFormGroup.controls.items.value[index].ContiPlant != "")
     if(this.warrantyFormGroup.controls.Plant.valid)
    {
      //this._customerService.getMaterialDetails(this.materialFormGroup.controls.items.value[index].ContiPlant, this.materialFormGroup.controls.items.value[index].ContiPartNo).then(
        this._customerService.getMaterialDetails(this.warrantyFormGroup.value.Plant, this.materialFormGroup.controls.items.value[index].ContiPartNo).then(
        (response) => 
        {
          var array = this.materialFormGroup.get('items') as FormArray;
          array.controls[index].patchValue({
            ContiPlant : this.warrantyFormGroup.value.Plant,
            ProfitCenter: response.ProfitCenter,
            ContiSegment: response.ContiSegment,
            ContiSubSegment: response.ContiSubSegment,
            MaterialDescription: response.MaterialDescription,
          });

          this.warrantyFormGroup.controls.ProfitCenter.patchValue(response.ProfitCenter);
          this.warrantyFormGroup.controls.Segment.patchValue(response.ContiSegment + ' - ' + response.ContiSubSegment);

          this.getCustomer();

          if(index == 0)
          {
            if(this.warrantyFormGroup.value.DocumentType == "WM")
            {
              this.getfirstApproverWithMaterial(index);
            }
          }

        }
      ).catch((err) => 
      {
        this._commonService.openSnackbar(err, snackbarStatus.Danger);
      });
    }
    else
    {
      this._commonService.openSnackbar("please fill plant field", snackbarStatus.Danger);
    }
  }

  // Get Method for Customer Details based on Conti Part Number
  getCustomer()
  {
    if(this.materialFormGroup.controls.items.value[0].ContiPartNo != null || this.materialFormGroup.controls.items.value[0].ContiPartNo != "")
    {
      this._customerService.getCustomersDetails(this.materialFormGroup.controls.items.value[0].CustomerPartNo, this.materialFormGroup.controls.items.value[0].ContiPartNo).subscribe({
        next : (response) => 
        {
          this.warrantyFormGroup.controls.CustomerCode.reset();
          this.warrantyFormGroup.controls.CustomerName.reset();
          this.customerNameList = [];
          if(response.length == 1)
          {
            this.warrantyFormGroup.controls.CustomerCode.patchValue(response[0].CustomerCode);
            this.warrantyFormGroup.controls.CustomerName.patchValue(response[0].CustomerName);
          }
          else
          {
            this.customerNameList = response;
          }
        },error : (err) => {
          this._commonService.openSnackbar(err, snackbarStatus.Danger);
        },
      })
    }
    // else
    // {
    //   this._customerService.getCustomersDetails(this.materialFormGroup.controls.items.value[index].CustomerPartNo, this.materialFormGroup.controls.items.value[index].ContiPartNo).subscribe({
    //     next : (response) => 
    //     {
    //       this.warrantyFormGroup.controls.CustomerCode.reset();
    //       this.warrantyFormGroup.controls.CustomerName.reset();
    //       this.customerNameList = [];
    //       if(response.length == 1)
    //       {
    //         this.warrantyFormGroup.controls.CustomerCode.patchValue(response[0].CustomerCode);
    //         this.warrantyFormGroup.controls.CustomerName.patchValue(response[0].CustomerName);
    //       }
    //       else
    //       {
    //         this.customerNameList = response;
    //       }
    //     },error : (err) => {
    //       this._commonService.openSnackbar(err, snackbarStatus.Danger);
    //     },
    //   })
    // }
  }

  // Auto Sum for total Claim Value Method
  totalClaimValue(i)
  {

    var totalObj = {
      TotalClaimValue : ''
    }

    totalObj.TotalClaimValue = this.materialFormGroup.controls.items.value[i].BaseClaimValue + 
                              this.materialFormGroup.controls.items.value[i].Handling + 
                              this.materialFormGroup.controls.items.value[i].LabourCost + 
                              this.materialFormGroup.controls.items.value[i].RepairCost + 
                              this.materialFormGroup.controls.items.value[i].ForwardingCost + 
                              this.materialFormGroup.controls.items.value[i].SubletCost + 
                              this.materialFormGroup.controls.items.value[i].ConsequentialCost;


    var array = this.materialFormGroup.get('items') as FormArray;
    array.controls[i].patchValue(totalObj);

  }

  // Sum of Final Claim Value, Tax
  debitValue(i)
  {

    var debitObj = {
      DebitValue : ''
    }

    debitObj.DebitValue = this.materialFormGroup.controls.items.value[i].FinalClaimValue + this.materialFormGroup.controls.items.value[i].Tax;

    var array = this.materialFormGroup.get('items') as FormArray;
    array.controls[i].patchValue(debitObj);

    this.totalValue = 0;

    array.value.forEach(element => {
      this.totalValue = Math.round((this.totalValue + element.DebitValue) * 100) / 100;
    });

  }

  // Add Method for Adding Material Form Group in Table
  add()
  {
    const addRow = this.materialFormGroup.get('items') as FormArray;
    var obj = this.getFormFields(this.materialFormGroup.get('items'));
    addRow.push(obj);
    this.dataSource.data.push(obj.value);
    this.dataSource._updateChangeSubscription();
  }

  // Get method for return Material Form Group Item Array
  getFormFields(element)
  {
    return this._fb.group({
      CustomerPartNo : [element.CustomerPartNo, Validators.required],
      ContiPartNo : [element.ContiPartNo, Validators.required],
      ContiPlant : [element.ContiPlant, Validators.required],
      ProfitCenter : [element.ProfitCenter, Validators.required],
      MaterialDescription : element.MaterialDescription,
      ContiSegment : element.ContiSegment,
      ContiSubSegment : element.ContiSubSegment,
      OEMPostReference : [element.OemPostReference, Validators.required],
      CarModel : element.CarModel,
      Currency : [element.Currency, Validators.required],
      DealerName : element.DealerName,
      ProblemDescription : element.ProblemDescription,
      DealerLocation : element.DealerLocation,
      Quantity : [element.Quantity, Validators.required],
      VIN : element.Vin,
      CQTSQN : element.CqtsQn,
      ContiProductionDate : element.ContiProductionDate,
      RegistrationDate : element.RegistrationDate,
      RepairDate : element.RepairDate,
      ReturnDate : element.ReturnDate,
      Mileage : element.Mileage,
      SaleValue : element.SaleValue,
      BaseClaimValue : element.BaseClaimValue,
      Handling : element.Handling,
      LabourCost : element.LabourCost,
      RepairCost : element.RepairCost,
      ForwardingCost : element.ForwardingCost,
      SubletCost : element.SubletCost,
      ConsequentialCost : element.ConsequentialCost,
      TechnicalFactor : element.TechnicalFactor,
      Tax : element.Tax,
      Remarks : element.Remarks,
      TotalClaimValue : [element.TotalClaimValue, Validators.required],
      FinalClaimValue : element.FinalClaimValue,
      DebitValue : [element.DebitValue, Validators.required],
    })
  }

  // Change Date Format
  changeDateFormat(date)
  {
    return this._datePipe.transform(date, "dd/MM/yyyy");
  }

  // File Upload Method
  onUploadFileChange(event)
  {
    this.files = event.target.files[0];
    this._commonService.openSnackbar("Uploaded Successfully", snackbarStatus.Success);
  }

  // Excel Upload for Material Line Items
  onFileChange(event: any) 
  {

    if(this.warrantyFormGroup.controls.Plant.valid)
    {
      const file : File = event.target.files[0];

      if(file)
      {
        const fileName : string = file.name.toLocaleLowerCase();
        if(fileName.endsWith('.xlsx') || fileName.endsWith('.xls'))
        {

          const reader = new FileReader();
          
          reader.onload = (e: any) => {
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const table : any = XLSX.utils.sheet_to_json(worksheet, { raw: true });

          table.forEach(element => {
            if(!element.SaleValue)
            {
              element.SaleValue = 0;
            }
            if(!element.BaseClaimValue)
            {
              element.BaseClaimValue = 0;
            }
            if(!element.Handling)
            {
              element.Handling = 0;
            }
            if(!element.LabourCost)
            {
              element.LabourCost = 0;
            }
            if(!element.RepairCost)
            {
              element.RepairCost = 0;
            }
            if(!element.ForwardingCost)
            {
              element.ForwardingCost = 0;
            }
            if(!element.SubletCost)
            {
              element.SubletCost = 0;
            }
            if(!element.ConsequentialCost)
            {
              element.ConsequentialCost = 0;
            }
            if(!element.TechnicalFactor)
            {
              element.TechnicalFactor = "";
            }
            if(!element.Remarks)
            {
              element.Remarks = "";
            }

            if(!element.CarModel)
            {
              element.CarModel = "NA";
            }
            if(!element.Currency)
            {
              element.Currency = "NA";
            }
            if(!element.DealerName)
            {
              element.DealerName = "NA";
            }
            if(!element.ProblemDescription)
            {
              element.ProblemDescription = "NA";
            }
            if(!element.DealerLocation)
            {
              element.DealerLocation = "NA";
            }
            if(!element.Quantity)
            {
              element.Quantity = 0;
            }

            if(!element.Vin)
            {
              element.Vin = "NA";
            }
            if(!element.CqtsQn)
            {
              element.CqtsQn = "NA";
            }
            if(!element.Mileage)
            {
              element.Mileage = "NA";
            }

            this.getValidDate(element);

          });
          
          if(this.ValidateColumn(table, this.requiredColumns))
          {

          table.forEach(element => {
            this.tableData.push(element);
          });

          this.tableData.forEach(element => {

            element.TotalClaimValue = element.BaseClaimValue + 
                                      element.Handling + 
                                      element.LabourCost + 
                                      element.RepairCost + 
                                      element.ForwardingCost + 
                                      element.SubletCost + 
                                      element.ConsequentialCost;

            element.FinalClaimValue = element.TotalClaimValue;
            element.DebitValue = Math.round((element.Tax + element.FinalClaimValue) * 100) / 100;

            //this.getValidDate(element);

            // element.ContiProductionDate = new Date(element.ContiProductionDate);
            // element.RegistrationDate = new Date(element.RegistrationDate);
            // element.RepairDate = new Date(element.RepairDate);
            // element.ReturnDate = new Date(element.ReturnDate);

          });

          
            for(var i = this.tableData.length - table.length; i < this.tableData.length; i++)
            {
              this.totalValue = Math.round((this.totalValue + this.tableData[i].DebitValue) * 100) / 100;
              const addRow = this.materialFormGroup.get('items') as FormArray;
              var obj = this.getFormFields(this.tableData[i]);
              addRow.push(obj);
              this.getContiPartNo(i);
              this.dataSource.data.push(obj.value);
              this.dataSource._updateChangeSubscription();
            }
          }
          else
          {
            this._commonService.openSnackbar("Invalid file format. Please upload a valid Excel file (.xlsx or .xls) and try again.", snackbarStatus.Warning);
          }

          };
          
          reader.readAsBinaryString(file);

        }
        else
        {
          this._commonService.openSnackbar("Invalid file format. Please upload a valid Excel file (.xlsx or .xls) and try again.", snackbarStatus.Warning);
        }
      }
    }
    else
    {
      this._commonService.openSnackbar("Please fill plant field", snackbarStatus.Danger);
    }
  }

  private getValidDate(element : any)
  {
    if(element.ReturnDate)
          {
            element.ReturnDate = new Date(element.ReturnDate);
          }
          else
          {
            element.ReturnDate = "";
          }
          if(element.RepairDate)
          {
            element.RepairDate = new Date(element.RepairDate);
          }
          else
          {
            element.RepairDate = "";
          }
          if(element.RegistrationDate)
          {
            element.RegistrationDate = new Date(element.RegistrationDate);
          }
          else
          {
            element.RegistrationDate = "";
          }
          if(element.ContiProductionDate)
          {
            element.ContiProductionDate = new Date(element.ContiProductionDate);
          }
          else
          {
            element.ContiProductionDate = "";
          }
  }

private ValidateColumn(data : any [], requiredColumns : string []) : boolean
{
  if(data.length == 0)
  {
    return false;
  }
  const columnInFile : string [] = Object.keys(data[0]).map(column => column);
  return requiredColumns.every(column => columnInFile.includes(column))
}

    // Remove Particular Material Line Items in Table 
    remove(i)
    {
      const array = this.materialFormGroup.get('items') as FormArray;
      array.removeAt(i);
      this.totalValue = 0;
      this.tableData.splice(i,1);
      this.dataSource.data.splice(i, 1);
      this.dataSource._updateChangeSubscription();
      this._commonService.openSnackbar(`Remove row - ${i}`, snackbarStatus.Danger);
      array.value.forEach(element => {
        this.totalValue = Math.round((this.totalValue + element.DebitValue) * 100) / 100;
      });
    }

    // Create Method for Warranty
    execute()
    {

      if(this.warrantyFormGroup.valid)
      {
        if(this.materialFormGroup.valid)
        {
          if(this.materialFormGroup.get('items').value.length > 0)
          {
            if(this.files)
            {

              this._commonSpinner.showSpinner();

              if(this.warrantyFormGroup.value.DocumentType == "WO")
              {
                this.warrantyFormGroup.value.SalesOrderNo = null;
              }

              var materialDto = new MaterialDto();
              materialDto.UserId = this.userDetails.UserId;
              materialDto.trackingNo = this.warrantyFormGroup.value.TrackingNo;
              materialDto.firstApproval = this.warrantyFormGroup.value.FirstApproval;
              materialDto.claimForMonth = this.warrantyFormGroup.value.ClaimForMonth;
              materialDto.claimForYear = (Number)(this.warrantyFormGroup.value.ClaimForYear);
              this.materialFormGroup.get('items').value.forEach(element => {
                element.CustomerPartNo = element.CustomerPartNo.toString();
                if(element.CQTSQN != null)
                {
                  element.CQTSQN = element.CQTSQN.toString();
                }
                if(element.Mileage != null)
                {
                  element.Mileage = element.Mileage.toString();
                }
                element.ContiPlant = element.ContiPlant.toString();
                element.ProfitCenter = element.ProfitCenter.toString();
                
              });
              var array = this.materialFormGroup.get('items').value;
              array.forEach(element => {
                element.TrackingNo = this.warrantyFormGroup.value.TrackingNo;
                element.customerCode = this.warrantyFormGroup.value.CustomerCode;
                element.CustomerName = this.warrantyFormGroup.value.CustomerName;
                element.Attribution = this.warrantyFormGroup.value.Attribution;
                element.DocumentType = this.warrantyFormGroup.value.DocumentType;
                element.SalesOrderNo = this.warrantyFormGroup.value.SalesOrderNo;
              });

              materialDto.materialStores = array;

              const formData = new FormData();
              formData.append("MaterialDto", JSON.stringify(materialDto));
              formData.append(this.files.name, this.files, this.files.name);

              this._customerService.saveMaterial(formData).subscribe({
                next : (response) => 
                {
                  this._commonSpinner.hideSpinner();
                  this._commonService.openSnackbar(response.Message, snackbarStatus.Success);
                  this._router.navigate(['/pages/warrantypages/dashboard']);
                },error : (err) => {
                  this._commonSpinner.hideSpinner();
                  if(err == "Tracking No Already Exists")
                  {
                    this.addTracking();
                  }
                  else
                  {
                    this._commonService.openSnackbar(err, snackbarStatus.Danger);
                  }
                },
              })
            }
            else
            {
              this._commonService.openSnackbar("Attachment is Mandatory", snackbarStatus.Danger);
            }
          }
          else
          {
            this._commonService.openSnackbar("Please complete all mandatory fields before proceeding.", snackbarStatus.Danger);
          }
        }
        else
        {
          this._commonService.openSnackbar("Please fill the all mandatory fields - Customer Part No, Conti Part No, Plant, Profit Center, OEM Reference, Currency, Quality, Total Claim Value, Debit value", snackbarStatus.Danger);
          this.materialFormGroup.markAllAsTouched();
        }
      }
      else
      {
        if(this.warrantyFormGroup.controls.FirstApproval.invalid && 
          this.warrantyFormGroup.controls.CustomerName.invalid && 
          this.warrantyFormGroup.controls.CustomerCode.invalid && 
          this.warrantyFormGroup.controls.ClaimForMonth.invalid && 
          this.warrantyFormGroup.controls.ClaimForYear.invalid)
          {
            this.warrantyFormGroup.markAllAsTouched();
            this._commonService.openSnackbar("Please Enter Customer Details fields", snackbarStatus.Danger);
          }
          else if(this.warrantyFormGroup.controls.FirstApproval.invalid)
          {
            this.warrantyFormGroup.controls.FirstApproval.markAsTouched();
            this._commonService.openSnackbar("Please Enter First Approval fields", snackbarStatus.Danger);
          }
          else if(this.warrantyFormGroup.controls.CustomerCode.invalid)
          {
            this.warrantyFormGroup.controls.CustomerCode.markAsTouched();
            this._commonService.openSnackbar("Please Enter Customer Code fields", snackbarStatus.Danger);
          }
          else if(this.warrantyFormGroup.controls.CustomerName.invalid)
          {
            this.warrantyFormGroup.controls.CustomerName.markAsTouched();
            this._commonService.openSnackbar("Please Enter Customer Name fields", snackbarStatus.Danger);
          }
          else if(this.warrantyFormGroup.controls.ClaimForMonth.invalid)
          {
            this.warrantyFormGroup.controls.ClaimForMonth.markAsTouched();
            this._commonService.openSnackbar("Please Enter Claim For Month fields", snackbarStatus.Danger);
          }
          else if(this.warrantyFormGroup.controls.ClaimForYear.invalid)
          {
            this.warrantyFormGroup.controls.ClaimForYear.markAsTouched();
            this._commonService.openSnackbar("Please Enter Claim For Year fields", snackbarStatus.Danger);
          }
      }
      
    }

    // Update Method for Warranty
    updateWarranty()
    {
      if(this.warrantyFormGroup.valid)
      {
        if(this.materialFormGroup.valid)
        {

          if(this.materialFormGroup.get('items').value.length > 0)
          {

          this._commonSpinner.showSpinner();
          var materialDto = new MaterialDto();
          materialDto.UserId = this.userDetails.UserId;
          materialDto.trackingNo = this.warrantyFormGroup.value.TrackingNo;
          materialDto.firstApproval = this.warrantyFormGroup.value.FirstApproval;
          materialDto.claimForMonth = this.warrantyFormGroup.value.ClaimForMonth;
          materialDto.claimForYear = (Number)(this.warrantyFormGroup.value.ClaimForYear);
          this.materialFormGroup.get('items').value.forEach(element => {
            element.CustomerPartNo = element.CustomerPartNo.toString();
            element.CQTSQN = element.CQTSQN.toString();
            if(element.Mileage != null)
            {
              element.Mileage = element.Mileage.toString();
            }
            element.ContiPlant = element.ContiPlant.toString();
            element.ProfitCenter = element.ProfitCenter.toString();
            if(element.Vin == null)
            {
              element.VIN = "NA";
            }
            if(element.Mileage == null)
            {
              element.Mileage = "NA";
            }
          });
          var array = this.materialFormGroup.get('items').value;
          array.forEach(element => {
            element.TrackingNo = this.warrantyFormGroup.value.TrackingNo;
            element.customerCode = this.warrantyFormGroup.value.CustomerCode;
            element.CustomerName = this.warrantyFormGroup.value.CustomerName;
            element.Attribution = this.warrantyFormGroup.value.Attribution;
            element.DocumentType = this.warrantyFormGroup.value.DocumentType;
          });

              materialDto.materialStores = array;

              const formData = new FormData();
              formData.append("MaterialDto", JSON.stringify(materialDto));
              if(this.files)
              {
                formData.append(this.files.name, this.files, this.files.name);
              }

              this._customerService.updateMaterial(formData).subscribe({
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
              this._commonService.openSnackbar("Please complete all mandatory fields before proceeding.", snackbarStatus.Danger);
            }
        }
        else
        {
          this._commonService.openSnackbar("Please fill the all mandatory fields - Customer Part No, Conti Part No, Plant, Profit Center, OEM Reference, Currency, Quality, Total Claim Value, Debit value", snackbarStatus.Danger);
        }
      }
      else
      {
        if(this.warrantyFormGroup.controls.FirstApproval.invalid && 
          this.warrantyFormGroup.controls.CustomerName.invalid && 
          this.warrantyFormGroup.controls.CustomerCode.invalid && 
          this.warrantyFormGroup.controls.ClaimForMonth.invalid && 
          this.warrantyFormGroup.controls.ClaimForYear.invalid)
          {
            this.warrantyFormGroup.markAllAsTouched();
            this._commonService.openSnackbar("Please Enter Customer Details fields", snackbarStatus.Danger);
          }
          else if(this.warrantyFormGroup.controls.FirstApproval.invalid)
          {
            this.warrantyFormGroup.controls.FirstApproval.markAsTouched();
            this._commonService.openSnackbar("Please Enter First Approval fields", snackbarStatus.Danger);
          }
          else if(this.warrantyFormGroup.controls.CustomerCode.invalid)
          {
            this.warrantyFormGroup.controls.CustomerCode.markAsTouched();
            this._commonService.openSnackbar("Please Enter Customer Code fields", snackbarStatus.Danger);
          }
          else if(this.warrantyFormGroup.controls.CustomerName.invalid)
          {
            this.warrantyFormGroup.controls.CustomerName.markAsTouched();
            this._commonService.openSnackbar("Please Enter Customer Name fields", snackbarStatus.Danger);
          }
          else if(this.warrantyFormGroup.controls.ClaimForMonth.invalid)
          {
            this.warrantyFormGroup.controls.ClaimForMonth.markAsTouched();
            this._commonService.openSnackbar("Please Enter Claim For Month fields", snackbarStatus.Danger);
          }
          else if(this.warrantyFormGroup.controls.ClaimForYear.invalid)
          {
            this.warrantyFormGroup.controls.ClaimForYear.markAsTouched();
            this._commonService.openSnackbar("Please Enter Claim For Year fields", snackbarStatus.Danger);
          }
      }
    }



    addTracking()
    {
      const dialogRef = this._dialog.open(TrackingDialogComponent, {
        disableClose: true,
        backdropClass: 'userActivationDialog',
      }).afterClosed().subscribe((res) => {
        if(res == "Add")
        {
          this.getTrackingNo();
        }
      });
    }



    getSelectedPlant(selectedPlant)
    {
      return this.plantDetails.find(plant => plant.Plant === selectedPlant);
    }



}