import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { StopProvider } from '../../providers/stop/stop';
import { Stop, Bus } from '../../providers/stop/class';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  listStops: Stop[] = [];
  searchedStops: Array<string> = [];
  @ViewChild("stopInput") stopInput;

  constructor(public navCtrl: NavController, public stopProvider: StopProvider) {
    this.listStops = [];
    this.searchedStops = [];
    
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
  }

  clearSearch(e) {
    this.stopInput.value = "";
  }

  refreshStops(target? : string) {
    this.searchedStops.forEach((stop : string, idx, arr) => {
      // Skip if just asked to refresh a particular stop and if this one isn't it
      if (target && target != stop) return;

      // Check if we already have this stop in the list (i.e. if stop card is already visible)
      var result : Stop = this.listStops.find((element, index, obj) => element.title == stop);
      var resultExists = !(result == undefined);

      // Instantiate new stop card
      if (result == undefined) result = new Stop(stop);

      // Add to stops list, this will show a partially loaded card on screen
      if (!resultExists) this.listStops.push(result);
      else result.isRefreshing = true;

      // Request next buses information
      this.stopProvider.getStop(stop)
        .then((response : Bus[]) => {
          result.buses = response;
          result.isRefreshing = false;
          console.log(result);
        })
    });
  }

  deleteStop(stop) {
    var indexSearch = this.searchedStops.indexOf(stop.title);
    if (indexSearch > -1) {
      this.searchedStops.splice(indexSearch);
    }

    var findListed : Stop = this.listStops.find((element, index, obj) => element.title == stop.title);
    var indexListed = this.listStops.indexOf(findListed);

    if (findListed) {
      this.listStops.splice(indexListed);
    }
  }
}
