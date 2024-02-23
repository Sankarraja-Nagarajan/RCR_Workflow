/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from './@core/utils/analytics.service';
import { SeoService } from './@core/utils/seo.service';

@Component({
  selector: 'ngx-app',
  template: `<ngx-spinner
  bdColor="rgba(51,51,51,0.8)"
  size="large"
  color="white"
  type="square-jelly-box"
  [fullScreen] = "true">
  <!-- <p style="font-size: 20px; color: white">Loading...</p> -->
</ngx-spinner>
  <router-outlet></router-outlet>`,
})
export class AppComponent implements OnInit {

  constructor(private analytics: AnalyticsService, private seoService: SeoService) {
  }

  ngOnInit(): void {
    this.analytics.trackPageViews();
    this.seoService.trackCanonicalChanges();
  }
}
