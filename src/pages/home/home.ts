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
      this.refreshStops();
    }

    this.stopInput.value = "";
  }

  clearSearch(e) {
    this.stopInput.value = "";
  }

  refreshStops() {
    this.searchedStops.forEach((stop : string, idx, arr) => {
      this.stopProvider.getStop(stop)
        .then((response : any) => {
          var data = response.data;

          var parser = new DOMParser();
          var htmlDoc = parser.parseFromString(data, 'text/html');
          
          var result = this.listStops.find((element, index, obj) => element.title == stop);
          var resultExists = !(result == undefined);

          if (result == undefined) result = { title: stop, buses: [] };
          else result.buses = [];
          
          var tableRows : HTMLTableRowElement[] = Array.from(htmlDoc.querySelectorAll('tr.even'));
          tableRows.forEach((row : HTMLTableRowElement, i, tr) => {
            var line = row.querySelectorAll("td > ul > li > a")[0].innerHTML.trim();
            var time = row.querySelectorAll("td > i")[0].innerHTML.trim();
            result.buses.push({time, line});
          });

          console.log(result);
          if (!resultExists) this.listStops.push(result);
        })
    });
  }
}
