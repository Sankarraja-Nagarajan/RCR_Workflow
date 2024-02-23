import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'ngx-one-column-layout',
  styleUrls: ['./one-column.layout.scss'],
  template: `
    <nb-layout windowMode>
      <nb-layout-header fixed *ngIf="hideSidenav">
        <ngx-header></ngx-header>
      </nb-layout-header>

      <nb-layout-column [ngClass]="{'content-padding' : hideSidenav === false}">
        <ng-content select="router-outlet"></ng-content>
      </nb-layout-column>

      <nb-layout-footer fixed *ngIf="hideSidenav">
        <ngx-footer></ngx-footer>
      </nb-layout-footer>
    </nb-layout>
  `,
})
export class OneColumnLayoutComponent {
   
  hideSidenav : Boolean;

  constructor(private router:Router){

    this.router.events.subscribe({
      next : (response) => 
      {
        // console.log("Navigation End : ", response instanceof NavigationEnd);
        if(response instanceof NavigationEnd)
        {
          if(response.urlAfterRedirects.includes('/login'))
          {
            this.hideSidenav = false;
          }
          else
          {
            this.hideSidenav = true;
          }
        }
      }
    })  
  }
}
