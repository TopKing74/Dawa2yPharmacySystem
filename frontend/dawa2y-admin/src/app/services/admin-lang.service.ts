import { Injectable, signal, effect } from '@angular/core';

export type AdminLanguage = 'en' | 'ar';

@Injectable({
  providedIn: 'root'
})
export class AdminLangService {
  currentLang = signal<AdminLanguage>('en');

  constructor() {
    const saved = localStorage.getItem('dawa2y_admin_lang') as AdminLanguage;
    if (saved && (saved === 'en' || saved === 'ar')) {
      this.currentLang.set(saved);
    }
    this.updateHtmlAttributes(this.currentLang());

    effect(() => {
      const lang = this.currentLang();
      localStorage.setItem('dawa2y_admin_lang', lang);
      this.updateHtmlAttributes(lang);
    });
  }

  isAr(): boolean {
    return this.currentLang() === 'ar';
  }

  direction(): 'rtl' | 'ltr' {
    return this.currentLang() === 'ar' ? 'rtl' : 'ltr';
  }

  toggleLanguage(): void {
    const next: AdminLanguage = this.currentLang() === 'en' ? 'ar' : 'en';
    this.currentLang.set(next);
  }

  private updateHtmlAttributes(lang: AdminLanguage): void {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  }
}

