import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TabService } from '../../Services/tab.service';
import { LanguageService } from '../../Services/language.service';
import { filter, Observable } from 'rxjs';
import { AccountService } from '../../Services/API/account.service';
import { ButtonComponent } from '../button/button.component';
import { PersistDataService } from '../../Services/persist-data.service';
import { SweetAlertService } from '../../Services/sweet-alert.service';

@Component({
  selector: 'app-top-bar',
  imports: [TranslateModule, NgIf, NgFor, ButtonComponent],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css',
})
export class TopBarComponent implements OnInit {
  isUserLoggedIn: boolean = false;

  latestRoute: any;
  selectedLang: string = '';
  showDetection: boolean = false;

  tabs: any[] = [
    { titleEN: 'Home', titleAR: 'الرئيسية', route: 'home', isSelected: true },

    { titleEN: 'Songs', titleAR: 'الأغاني', route: 'songs', isSelected: false },
    {
      titleEN: 'Movies',
      titleAR: 'الأفلام',
      route: 'movies',
      isSelected: false,
    },
    {
      titleEN: 'Library',
      titleAR: 'المكتبة',
      route: 'library',
      isSelected: false,
    },
    {
      titleEN: 'Profile',
      titleAR: 'الملف الشخصي',
      route: 'profile',
      isSelected: false,
    },
  ];

  constructor(
    private readonly router: Router,
    private readonly languageServie: LanguageService,
    private readonly accountService: AccountService,
    private readonly tabService: TabService,
    private readonly persistDataService: PersistDataService,
    private readonly languageService: LanguageService,
    private readonly sweetAlertService: SweetAlertService
  ) {}

  ngOnInit(): void {
    this.persistDataService.emotion$.subscribe({
      next: (response: string) => {
        if (response.length == 0) {
          this.showDetection = false;
        } else {
          this.showDetection = true;
        }
      },
    });

    // get last set language
    this.languageService.language$.subscribe({
      next: (response: string) => {
        this.selectedLang = response;
      },
    });
    // this.selectedLang = this.languageServie.getLastSetLanguage();

    this.getTab();

    this.isUserLoggedInFunction();

    this.getLatestRoute();
  }

  isUserLoggedInFunction() {
    // isUserLogged In?
    this.accountService.isUserLoggedIn().subscribe({
      next: (response: any) => {
        this.isUserLoggedIn = response;
      },
    });
  }

  getLatestRoute() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Store the latest URL
        this.latestRoute = event.urlAfterRedirects;
        console.log('Latest route:', this.latestRoute);
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

    this.tabService.setSelectedTab(tab.route);
  }

  updateLang(lang: string) {
    this.selectedLang = lang;
    this.languageServie.updateLanguage(lang);
  }

  getStarted() {
    this.router.navigateByUrl('login');
  }

  letsEsc() {
    this.router.navigateByUrl('lets-escape');
  }

  logout() {
    this.sweetAlertService
      .confrim('Are you sure you want to log out ?')
      .then((response) => {
        if (response.isConfirmed) {
          this.accountService.logout();
        }
      });
  }
}
