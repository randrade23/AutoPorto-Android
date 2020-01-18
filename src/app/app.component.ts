import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { TranslateService } from '@ngx-translate/core';
import { HomePage } from '../pages/home/home';
import { Globalization } from '@ionic-native/globalization';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = HomePage;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, translate: TranslateService, globalization: Globalization) {
    globalization.getPreferredLanguage().then((res : any) => {
      translate.setDefaultLang('en');

      res.value = res.value.split('-')[0];

      if (res.value == 'pt') {
        translate.use('pt');
      }

      platform.ready().then(() => {
        // Okay, so the platform is ready and our plugins are available.
        // Here you can do any higher level native things you might need.
        statusBar.styleBlackOpaque();
        splashScreen.hide();
      });
    });
  }
}

