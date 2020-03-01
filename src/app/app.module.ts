import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { StopProvider } from '../providers/stop/stop';
import { HTTP } from '@ionic-native/http';
import { IonicStorageModule } from '@ionic/storage';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateLoader } from '@ngx-translate/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Globalization } from '@ionic-native/globalization';
import { Geolocation } from '@ionic-native/geolocation';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics';
import { NearStopsProvider } from '../providers/near-stops/near-stops';

export function setTranslateLoader(http: HttpClient) {
 return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    MyApp,
    HomePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (setTranslateLoader),
        deps: [HttpClient]
      }
    }),
    HttpClientModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Globalization,
    Geolocation,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    StopProvider,
    HTTP,
    LocalNotifications,
    BarcodeScanner,
    NearStopsProvider,
    FirebaseAnalytics
  ]
})
export class AppModule {}
