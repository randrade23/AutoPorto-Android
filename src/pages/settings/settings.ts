import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { Globalization } from '@ionic-native/globalization';

/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public translate: TranslateService,
    public globalization: Globalization) {
    globalization.getPreferredLanguage().then((res: any) => {
      translate.setDefaultLang('en');

      res.value = res.value.split('-')[0];

      if (res.value == 'pt') {
        translate.use('pt');
      }
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }

  toggleNearStops(event) {
    console.log(event.target.value);
  }
}
