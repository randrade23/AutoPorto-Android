import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { StopProvider } from '../../providers/stop/stop';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  listStops: any[] = [];
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
      if (target && target != stop) return;

      var result = this.listStops.find((element, index, obj) => element.title == stop);
      var resultExists = !(result == undefined);

      if (result == undefined) result = { title: stop, buses: [], newBuses: [], isRefreshing: true };

      if (!resultExists) this.listStops.push(result);
      else result.isRefreshing = true;

      this.stopProvider.getStop(stop)
        .then((response : any) => {
          var data = response.data;

          var parser = new DOMParser();
          var htmlDoc = parser.parseFromString(data, 'text/html');
          
          var tableRows : HTMLTableRowElement[] = Array.from(htmlDoc.querySelectorAll('tr.even'));
          tableRows.forEach((row : HTMLTableRowElement, i, tr) => {
            var line = row.querySelectorAll("td > ul > li > a")[0].innerHTML.trim();
            var time = row.querySelectorAll("td > i")[0].innerHTML.trim();
            var destination = row.querySelectorAll("td")[0].innerText
                              .replace(line, "")
                              .replace(time, "")
                              .replace("-", "")
                              .trim()
                              .toLocaleLowerCase();
            result.newBuses.push({time, line, destination});
          });

          result.buses = result.newBuses;
          result.newBuses = [];

          result.isRefreshing = false;

          console.log(result);
        })
    });
  }
}
