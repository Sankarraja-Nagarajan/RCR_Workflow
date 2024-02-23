export class MaterialDto
{
    trackingNo : number;
    UserId : string;
    firstApproval : string;
    claimForMonth : string;
    claimForYear : number;
    materialStores : MaterialStore[];
}

export class MaterialAndRejection
{
    trackingNo : number;
    UserId : string;
    FirstApproval : string;
    ClaimForMonth : string;
    ClaimForYear : number;
    materialStores : MaterialStore[];
    rejectionHistories : Rejection[];
}


export class Rejection
{
    Id : number;
    Comments : string;
    Reason : string;
    UserId : string;
    UserName : string;
    TrackingNo : number;
    Role : string;
    RejectedOn : string;
}


// export class MaterialStore
// {
//   trackingNo : number;
//   customerPartNo : string;
//   contiPartNo : string;
//   customerCode : string;
//   customerName : string;
//   contiPlant : string;
//   FirstApproval : string;
//   salesOrderNo : string;
//   documentType : string;
//   attribution : string;
//   profitCenter : string;
//   materialDescription : string;
//   contiSegment : string;
//   contiSubSegment : string;
//   saleValue: number; 
// }

export class MaterialStore
{
    Id : number;
    TrackingNo : number;
    customerPartNo : string;
    contiPartNo : string;
    customerCode : string;
    customerName : string;
    contiPlant : string;
    FirstApproval : string;
    salesOrderNo : string;
    documentType : string;
    attribution : string;
    profitCenter : string;
    materialDescription : string;
    contiSegment : string;
    contiSubSegment : string;
    saleValue: number; 
    OemPostReference : string;
    CarModel : string;
    Currency : string;
    DealerName : string;
    ProblemDescription : string;
    DealerLocation : string;
    Quantity : string;
    Vin : string;
    CqtsQn : string;
    ContiProductionDate : string;
    RegistrationDate : string;
    RepairDate : string;
    ReturnDate : string;
    Mileage : string;
    BaseClaimValue : string;
    Handling : string;
    LabourCost : number;
    RepairCost : number;
    ForwardingCost : number;
    SubletCost : number;
    ConsequentialCost : number;
    TechnicalFactor : string;
    Tax : string;
    TotalClaimvalue : number;
    FinalClaimValue : number;
    DebitValue : number;
    Remarks : string;
}