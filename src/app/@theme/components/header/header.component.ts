import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService } from '@nebular/theme';

import { UserData } from '../../../@core/data/users';
import { LayoutService } from '../../../@core/utils';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LoginService } from '../../../../Services/login.service';
import { Router } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { ForgotPasswordDialogComponent } from '../../../pages/authentication/forgot-password-dialog/forgot-password-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  user: any;
  userFirstLetter : string;

  themes = [
    {
      value: 'default',
      name: 'Light',
    },
    {
      value: 'dark',
      name: 'Dark',
    },
    {
      value: 'cosmic',
      name: 'Cosmic',
    },
    {
      value: 'corporate',
      name: 'Corporate',
    },
  ];

  currentTheme = 'default';

  // /pages/authentication/login

  userMenu = [ { title: 'Profile' }, { title: 'Log out', link : '/pages/authentication/login' } ];

  role : string;

  collapsed = true;
  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
  }

  constructor(private sidebarService: NbSidebarService,
              private menuService: NbMenuService,
              private themeService: NbThemeService,
              private layoutService: LayoutService,
              private breakpointService: NbMediaBreakpointsService, 
              private _loginService : LoginService, 
              private _router : Router, 
              private _dialog : MatDialog) {
  }

  ngOnInit() {
    this.currentTheme = this.themeService.currentTheme;

    // this.userService.getUsers()
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((users: any) => this.user = users.nick);

    // this.user = "Nick Jones";

    const { xl } = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint.width < xl),
        takeUntil(this.destroy$),
      )
      .subscribe((isLessThanXl: boolean) => this.userPictureOnly = isLessThanXl);

    this.themeService.onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$),
      )
      .subscribe(themeName => this.currentTheme = themeName);

      this._loginService.userName$.subscribe({
        next : (response) => 
        {
          var token = this._loginService.decryptToken(response);
          this.user = token.Username;
          this.role = token.Role;
        }
      })

      if(!this.user)
      {
        var token = this._loginService.decryptToken(localStorage.getItem('Token'));
        this.user = token.Username;
        this.userFirstLetter = this.user.substring(0, 1);
        this.role = token.Role;
      }

  }

  changePassword()
  {
    this._dialog.open(ForgotPasswordDialogComponent, 
      {
        disableClose: true,
        backdropClass: 'userActivationDialog',
        data : 'Change Password',
      })
  }

  logout()
  {
    localStorage.removeItem('Token');
    this._router.navigate(['pages/authentication/login']);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeTheme(themeName: string) {
    this.themeService.changeTheme(themeName);
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();

    return false;
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }
}
