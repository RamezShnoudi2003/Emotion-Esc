import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TabService } from '../../Services/tab.service';
import { AccountService } from '../../Services/API/account.service';
import { filter } from 'rxjs';
import { ButtonComponent } from '../button/button.component';
import { LanguageService } from '../../Services/language.service';

@Component({
  selector: 'app-bottom-bar',
  imports: [NgFor, NgIf, ButtonComponent],
  templateUrl: './bottom-bar.component.html',
  styleUrl: './bottom-bar.component.css',
})
export class BottomBarComponent implements OnInit {
  isUserLoggedIn: boolean = false;
  latestRoute: any;
  lastSetLang: string = '';
  tabs: any[] = [
    {
      titleEN: 'Home',
      titleAR: 'الرئيسية',
      route: 'home',
      icon: 'assets/Icons/home.svg',
      filledIcon: 'assets/Icons/home-filled.svg',
      isSelected: true,
    },
    {
      titleEN: 'Songs',
      titleAR: 'الأغاني',
      route: 'songs',
      icon: 'assets/Icons/music.svg',
      filledIcon: 'assets/Icons/music-filled.svg',
      isSelected: false,
    },
    {
      titleEN: 'Movies',
      titleAR: 'الأفلام',
      route: 'movies',
      icon: 'assets/Icons/movie.svg',
      filledIcon: 'assets/Icons/movie-filled.svg',
      isSelected: false,
    },
    {
      titleEN: 'Library',
      titleAR: 'المكتبة',
      route: 'library',
      icon: 'assets/Icons/library.svg',
      filledIcon: 'assets/Icons/library-filled.svg',
      isSelected: false,
    },
    {
      titleEN: 'Profile',
      titleAR: 'الملف الشخصي',
      route: 'profile',
      icon: 'assets/Icons/profile.svg',
      filledIcon: 'assets/Icons/profile-filled.svg',
      isSelected: false,
    },
  ];

  constructor(
    private readonly router: Router,
    private readonly accountService: AccountService,
    private readonly tabService: TabService,
    private readonly languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.languageService.language$.subscribe({
      next: (response: string) => {
        this.lastSetLang = response;
      },
    });

    this.getTab();

    this.isUserLoggedInFunction();
  }

  isUserLoggedInFunction() {
    // isUserLogged In?
    this.accountService.isUserLoggedIn().subscribe({
      next: (response) => {
        this.isUserLoggedIn = response;
      },
    });
  }

  getTab() {
    // so when user refreshes it regets tab from localstorage and navigate to it
    let tab = localStorage.getItem('tab') || 'home';
    this.tabService.setSelectedTab(tab);

    this.tabService.selectedTab$.subscribe({
      next: (response: any) => {
        let lastSelectedTab = response;

        this.tabs.forEach((tab: any) => {
          if (tab.route == lastSelectedTab) {
            this.navigate(tab);
          }
        });
      },
    });
  }

  navigate(tab: any) {
    this.router.navigateByUrl(tab.route);

    this.tabs.forEach((item: any) => {
      item.isSelected = false;
    });

    tab.isSelected = true;

    // localStorage.setItem('tab', tab.route);
    this.tabService.setSelectedTab(tab.route);
  }

  getStarted() {
    this.router.navigateByUrl('login');
  }
}
