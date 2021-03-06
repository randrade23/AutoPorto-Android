import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { StopProvider } from '../../providers/stop/stop';
import { Stop, Bus } from '../../providers/class';
import { Storage } from '@ionic/storage';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { BarcodeScanner, BarcodeScanResult } from '@ionic-native/barcode-scanner';
import { TranslateService } from '@ngx-translate/core';
import { Geolocation, GeolocationOptions, Geoposition } from '@ionic-native/geolocation';
import { NearStopsProvider } from '../../providers/near-stops/near-stops';
import { Subscription } from 'rxjs';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  listStops: Stop[] = [];
  searchedStops: Array<string> = [];
  nearbyStops: Array<string> = [];
  lastLocation: Geoposition = undefined;
  locationTracker: Subscription = undefined;
  firstLoad: boolean = true;

  @ViewChild("stopInput") stopInput;

  constructor(public navCtrl: NavController,
    public stopProvider: StopProvider,
    public nearStopsProvider: NearStopsProvider,
    private storage: Storage,
    private translate: TranslateService,
    private location: Geolocation,
    private localNotifications: LocalNotifications,
    private barcodeScanner: BarcodeScanner,
    private firebaseAnalytics: FirebaseAnalytics) {
    this.listStops = [];
    this.searchedStops = [];
    this.nearbyStops = [];

    this.storage.ready().then((local: LocalForage) => {
      this.storage.get('search').then((data) => {
        if (data) {
          this.searchedStops = JSON.parse(data);
          this.refreshStops();
        }
      });
    });

    this.getNearStops();

    setInterval(() => {
      this.refreshStops();
    }, 15000);
  }

  submitSearch(e) {
    e.target.blur();
    
    var stop = this.stopInput.value.toUpperCase();

    this.reportFirebaseEvent('stop_searched', stop);
    this.addStop(stop);

    this.stopInput.value = "";
    this.storage.set('search', JSON.stringify(this.searchedStops));
  }

  clearSearch(e) {
    this.stopInput.value = "";
    this.reportFirebaseEvent('search_cleared');
  }

  async scanBarcode() {
    let prompt = await this.translate.get('barcodeScanner').toPromise();
    this.reportFirebaseEvent('barcode_scanner_started');
    this.barcodeScanner.scan({
      disableSuccessBeep: true,
      showTorchButton: true,
      orientation: 'portrait',
      prompt
    }).then((value: BarcodeScanResult) => {
      if (value.cancelled) return;

      let stop = value.text.toUpperCase();
      this.reportFirebaseEvent('barcode_scanner_result', stop);

      if (stop.includes("HTTP")) { // QR Codes to website
        // https://www.stcp.pt/pt/viajar/horarios/?paragem=MOD2&t=smsbus
        stop = stop.split("=")[1].split("&")[0];
        this.addStop(stop);
      }
    });
  }

  async toggleNotifications(stop: Stop) {
    this.listStops.forEach((value: Stop) => {
      if (stop != value) {
        value.isNotifying = false;
      }
    });

    stop.isNotifying = !stop.isNotifying;

    let text: string = await stop.toNotificationString(this.translate);

    if (stop.isNotifying) {
      // Schedule delayed notification
      this.localNotifications.schedule({
        text,
        led: 'FF0000',
        sound: null,
        vibrate: false
      });
    }
    else {
      this.localNotifications.clearAll();
    }
  }

  async refreshStops(target?: string) {
    let refresh = (stop: string, idx, arr) => {
      // Skip if just asked to refresh a particular stop and if this one isn't it
      if (target && target != stop) return;

      // Check if we already have this stop in the list (i.e. if stop card is already visible)
      var result: Stop = this.listStops.find((element, index, obj) => element.title == stop);
      var resultExists = !(result == undefined);

      // Instantiate new stop card
      if (result == undefined) result = new Stop(stop);

      // Add to stops list, this will show a partially loaded card on screen
      if (!resultExists) this.listStops.push(result);
      else result.isRefreshing = true;

      // Is it a nearby stop?
      if (this.nearbyStops.indexOf(stop) != -1) result.isNearby = true;

      // Request next buses information
      this.stopProvider.getStop(stop)
        .then(async (response: Bus[]) => {
          result.buses = response;
          result.isRefreshing = false;

          let text: string = await result.toNotificationString(this.translate);

          if (result.isNotifying) {
            // Schedule delayed notification
            this.localNotifications.schedule({
              text,
              led: 'FF0000',
              sound: null,
              vibrate: false
            });
          }

          console.log(result);
        })
    };

    this.searchedStops.forEach(refresh);
  }

  getNearStops(cachedLocation : Geoposition = undefined) {
    let locationCallback = async (position: Geoposition) => {
      this.firstLoad = false;

      if (!position || !position.coords) return;

      this.lastLocation = position;

      // Get stops in 500m which are not already in lists, and only the closest 5
      await this.nearStopsProvider.loadData();
      let nearStops = this.nearStopsProvider.getNearStopsByDistance(position, 500);
      nearStops = nearStops.filter(x => this.searchedStops.indexOf(x) == -1);
      nearStops = nearStops.slice(0, 5);
      
      this.nearbyStops = [];

      nearStops.forEach((stop: string) => {
        this.addNearbyStop(stop);
      });
    }

    if (cachedLocation) {
      locationCallback(cachedLocation);
    }
    else {
      let locationOptions : GeolocationOptions = {enableHighAccuracy: false, timeout: 2000};
      this.locationTracker = this.location.watchPosition(locationOptions)
        .subscribe(locationCallback, (error) => console.log(error));
    }
  }

  addStop(stop) {
    if (this.searchedStops.indexOf(stop) == -1) {
      this.searchedStops.push(stop);
      this.nearbyStops = this.nearbyStops.filter(x => x != stop);
      this.getNearStops(this.lastLocation);
      this.refreshStops(stop);
    }
  }

  addStopFromNearby(stop) {
    this.reportFirebaseEvent('nearby_stop', stop);
    this.addStop(stop);
  }

  addNearbyStop(stop) {
    if (this.searchedStops.indexOf(stop) == -1 && this.nearbyStops.indexOf(stop) == -1) {
      this.nearbyStops.push(stop);
    }
  }

  deleteStop(stop) {
    this.reportFirebaseEvent('deleted_stop', stop.title);

    var indexSearch = this.searchedStops.indexOf(stop.title);
    if (indexSearch > -1) {
      this.searchedStops.splice(indexSearch, 1);
    }

    var findListed: Stop = this.listStops.find((element, index, obj) => element.title == stop.title);
    var indexListed = this.listStops.indexOf(findListed);

    if (findListed) {
      this.listStops.splice(indexListed, 1);
    }

    this.getNearStops(this.lastLocation);

    this.storage.set('search', JSON.stringify(this.searchedStops));
  }

  openSettings() {
    this.navCtrl.push('SettingsPage');
  }

  reportFirebaseEvent(event: string, params: any = []) {
    this.firebaseAnalytics.setEnabled(true).then((res: any) => {
      this.firebaseAnalytics.logEvent(event, {page: "home", params})
      .then((res: any) => console.log(res))
      .catch((error: any) => console.error(error));
    });
  }
}
