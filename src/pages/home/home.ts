import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { StopProvider } from '../../providers/stop/stop';
import { Stop, Bus } from '../../providers/stop/class';
import { Storage } from '@ionic/storage';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { BarcodeScanner, BarcodeScanResult } from '@ionic-native/barcode-scanner';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  listStops: Stop[] = [];
  searchedStops: Array<string> = [];
  @ViewChild("stopInput") stopInput;

  constructor(public navCtrl: NavController,
      public stopProvider: StopProvider,
      private storage: Storage,
      private localNotifications: LocalNotifications,
      private barcodeScanner: BarcodeScanner) {
    this.listStops = [];
    this.searchedStops = [];

    this.storage.ready().then((local: LocalForage) => {
      this.storage.get('search').then((data) => {
        if (data) {
          this.searchedStops = JSON.parse(data);
          this.refreshStops();
        }
      });
    });

    setInterval(() => {
      this.refreshStops();
    }, 15000);
  }

  submitSearch(e) {
    var stop = this.stopInput.value.toUpperCase();

    if (this.searchedStops.indexOf(stop) == -1) {
      this.searchedStops.push(stop);
      this.refreshStops(stop);
    }

    this.stopInput.value = "";
    this.storage.set('search', JSON.stringify(this.searchedStops));
  }

  clearSearch(e) {
    this.stopInput.value = "";
  }

  scanBarcode() {
    this.barcodeScanner.scan({
      disableSuccessBeep: true,
      showTorchButton: true,
      orientation: 'portrait',
      prompt: 'Leia o código de barras no fundo da folha do horário na paragem'
    }).then((value: BarcodeScanResult) => {
      if (value.cancelled) return;
      
      let stop = value.text.toUpperCase();

      if (stop.includes("HTTP")) { // QR Codes to website
        // https://www.stcp.pt/pt/viajar/horarios/?paragem=MOD2&t=smsbus
        stop = stop.split("=")[1].split("&")[0];
      }

      if (this.searchedStops.indexOf(stop) == -1) {
        this.searchedStops.push(stop);
        this.refreshStops(stop);
      }
    });
  }

  toggleNotifications(stop: Stop) {
    this.listStops.forEach((value: Stop) => {
      if (stop != value) {
        value.isNotifying = false;
      }
    });

    stop.isNotifying = !stop.isNotifying;

    if (stop.isNotifying) {
      // Schedule delayed notification
      this.localNotifications.schedule({
        text: stop.toNotificationString(),
        led: 'FF0000',
        sound: null,
        vibrate: false
      });
    }
    else {
      this.localNotifications.clearAll();
    }
  }

  refreshStops(target?: string) {
    this.searchedStops.forEach((stop: string, idx, arr) => {
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

      // Request next buses information
      this.stopProvider.getStop(stop)
        .then((response: Bus[]) => {
          result.buses = response;
          result.isRefreshing = false;

          if (result.isNotifying) {
            // Schedule delayed notification
            this.localNotifications.schedule({
              text: result.toNotificationString(),
              led: 'FF0000',
              sound: null,
              vibrate: false
            });
          }

          console.log(result);
        })
    });
  }

  deleteStop(stop) {
    var indexSearch = this.searchedStops.indexOf(stop.title);
    if (indexSearch > -1) {
      this.searchedStops.splice(indexSearch, 1);
    }

    var findListed: Stop = this.listStops.find((element, index, obj) => element.title == stop.title);
    var indexListed = this.listStops.indexOf(findListed);

    if (findListed) {
      this.listStops.splice(indexListed, 1);
    }

    this.storage.set('search', JSON.stringify(this.searchedStops));
  }
}
