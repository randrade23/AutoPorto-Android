import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  listStops : any[] = [];
  @ViewChild("stopInput") stopInput;

  constructor(public navCtrl: NavController) {
    this.listStops.push({title: "MOD2", buses: [{destination: "HSJ", time: "1"}, {destination: "HSJ", time: "1"}]})
    this.listStops.push({title: "RCT1", buses: [{destination: "HSJ", time: "1"}, {destination: "HSJ", time: "1"}]})
    this.listStops.push({title: "RCT2", buses: [{destination: "HSJ", time: "1"}, {destination: "HSJ", time: "1"}]})
    this.listStops.push({title: "MOD1", buses: [{destination: "HSJ", time: "1"}, {destination: "HSJ", time: "1"}]})
    this.listStops.push({title: "SMM1", buses: [{destination: "HSJ", time: "1"}, {destination: "HSJ", time: "1"}]})
    this.listStops.push({title: "SMM1", buses: [{destination: "HSJ", time: "1"}, {destination: "HSJ", time: "1"}]})
  }

  submitSearch(e) {
    this.stopInput.value = "";
  }

  clearSearch(e) {
    this.stopInput.value = "";
  }
}
