import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly languageSubject: BehaviorSubject<string> =
    new BehaviorSubject<string>('en');

  language$: Observable<string> = this.languageSubject.asObservable();

  constructor(private readonly translateService: TranslateService) {}

  languageInit() {
    this.translateService.addLangs(['ar', 'en']);
    this.translateService.defaultLang = 'en';
    this.translateService.use('en');
    let currentLang = this.translateService.currentLang || 'en';
    document.body.classList.remove('ar', 'en');
    document.body.classList.add(currentLang);
    localStorage.setItem('language', currentLang);
    this.languageSubject.next(currentLang);
  }

  updateLanguage(lang: string) {
    let currentLanguage = this.translateService.currentLang;

    if (currentLanguage == lang) {
      return;
    }

    localStorage.setItem('language', lang);
    document.body.classList.remove('ar', 'en');
    document.body.classList.add(lang);
    this.translateService.use(lang);

    if (lang == 'ar') {
      document.body.dir = 'rtl';
    } else {
      document.body.dir = 'ltr';
    }

    this.languageSubject.next(lang);
  }
}
