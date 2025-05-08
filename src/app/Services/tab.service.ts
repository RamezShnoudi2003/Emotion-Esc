import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TabService {
  // Default tab title

  private readonly selectedTab: BehaviorSubject<string> =
    new BehaviorSubject<string>('home');
  selectedTab$ = this.selectedTab.asObservable();

  setSelectedTab(tab: string) {
    console.log('setting selected tab ', tab);
    if (this.selectedTab.getValue() !== tab) {
      localStorage.setItem('tab', tab);
      this.selectedTab.next(tab);
      console.log('sat selected tab ', this.selectedTab.getValue());
    }
  }

  // getSelectedTab() {
  //   let lastSelectedTab = localStorage.getItem('tab') || 'home';
  //   this.selectedTab.next(lastSelectedTab);
  //   return this.selectedTab$;
  // }
}
