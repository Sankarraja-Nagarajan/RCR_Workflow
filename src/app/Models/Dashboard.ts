export class DashboardTable
{
    allWarranty : any[] = [];
    pendingWarranty : any[] = [];
    approvedWarranty : any[] = [];
    rejectedWarranty : any[] = [];
    completedWarranty : any[] = [];
}

export class DashboardData
{
    TrackingNo : number;
    InitiatedDate : string;
    Item : number;
    CustomerCode : number;
    CustomerName : string;
    ContiPartNo : string;
    CustomerPartNo : number;
    MaterialDescription : string;
    Status : string;
    CurrentUser : string;
}