import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Geoposition } from '@ionic-native/geolocation';
import { STCPStop, Distance } from '../class';

/*
  Generated class for the NearStopsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class NearStopsProvider {
  data: STCPStop[];

  constructor(public http: HttpClient) {
    fetch('./assets/stops.json').then(res => res.json())
      .then(json => {
        this.data = json;
      })
  }

  getNearStopsByCount(location: Geoposition, count: number = 5) {
    let distanceMatrix = this.calculateDistanceMatrix(location);
    let stopNames = distanceMatrix.map(x => x.code);

    return Array.from(new Set(stopNames)).slice(0, count);
  }

  getNearStopsByDistance(location: Geoposition, distance: number = 250) { // Maximum distance to find stops in
    let distanceMatrix = this.calculateDistanceMatrix(location);
    let stopNames = distanceMatrix.filter(x => x.distance <= distance).map(x => x.code);

    return Array.from(new Set(stopNames));
  }

  private calculateDistanceMatrix(location: Geoposition) : Distance[] {
    let userLatitude = location.coords.latitude;
    let userLongitude = location.coords.longitude;

    let distanceMatrix = [];

    this.data.forEach((stcpStop : STCPStop) => {
      let stopLatitude = stcpStop.geomdesc.coordinates[1];
      let stopLongitude = stcpStop.geomdesc.coordinates[0];

      let distance = this.calculateDistance(userLatitude, userLongitude, stopLatitude, stopLongitude);

      let stopDistanceObject : Distance = new Distance(stcpStop.code, distance);
      distanceMatrix.push(stopDistanceObject);
    });

    distanceMatrix.sort((a, b) => (a.distance > b.distance) ? 1 : -1);

    console.log(distanceMatrix);

    return distanceMatrix;
  }

  private calculateDistance(lat1, lon1, lat2, lon2) { // Returns distance in meters
    var radlat1 = Math.PI * lat1 / 180;
    var radlat2 = Math.PI * lat2 / 180;
    var theta = lon1 - lon2;
    var radtheta = Math.PI * theta / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    dist = dist * 1.609344 * 1000.0;
    return dist;
  }

}
