import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { DatePipe } from '@angular/common';
import { ReportModel } from '../app/Models/report';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private _httpService : HttpService, private _datePipe : DatePipe) { }


  FilterTrackingId(trackingNos, CreatedFrom, CreatedTo, plant, userId, particularDates)
  {

    const formattedCreatedFrom = CreatedFrom ? this._datePipe.transform(CreatedFrom, 'yyyy-MM-dd') : null;
    const formattedCreatedTo = CreatedTo ? this._datePipe.transform(CreatedTo, 'yyyy-MM-dd') : null;

    var report = new ReportModel;
    report.TrackingNos = trackingNos;
    report.CreatedFrom = formattedCreatedFrom;
    report.CreatedTo = formattedCreatedTo;
    report.Plant = plant;
    report.UserId = userId;
    


    //particularDates = ["2024-01-02", "2024-01-04"];

    report.ParticularDates = particularDates;
    //const formattedParticularDates = particularDates ? particularDates.map(date => this._datePipe.transform(date, 'yyyy-MM-dd')) : null;

    const url = `Report/FilterTrackingId?trackingNos=${trackingNos}` +
              `${formattedCreatedFrom !== null ? `&CreatedFrom=${formattedCreatedFrom}` : ''}` +
              `${formattedCreatedTo !== null ? `&CreatedTo=${formattedCreatedTo}` : ''}` +
              `&plant=${plant}&userId=${userId}` +
              `${particularDates !== null ? `&particularDates=${particularDates}` : ''}`;

  // Make the HTTP request
  return this._httpService.post(`Report/FilterTrackingId`, report);
  }


}
