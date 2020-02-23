import { HTTP, HTTPResponse } from '@ionic-native/http';

import { Injectable } from '@angular/core';
import { Bus } from '../class';

/*
  Generated class for the StopProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class StopProvider {
  BASE_STCP_URL: string = "https://www.stcp.pt/pt/itinerarium/soapclient.php?codigo=";

  constructor(private http: HTTP) {
    console.log('Hello StopProvider Provider');
  }

  getStop(stop : string) {
    return new Promise(resolve => {
      this.http.get(this.BASE_STCP_URL + stop, {}, {})
        .then((response : HTTPResponse) => {
          var data = response.data;

          var newBuses : Bus[] = [];

          var parser = new DOMParser();
          var htmlDoc = parser.parseFromString(data, 'text/html');
          
          var tableRows : HTMLTableRowElement[] = Array.from(htmlDoc.querySelectorAll('tr.even'));
          tableRows.forEach((row : HTMLTableRowElement, i, tr) => {
            var line = row.querySelectorAll("td > ul > li > a")[0].innerHTML.trim();
            var time = row.querySelectorAll("td > i")[0].innerHTML.trim();
            var remaining = row.querySelectorAll("td:nth-child(3)")[0].innerHTML
                              .trim()
                              .replace(/(\d+)/, "$1 "); // Add a space after the number
            var destination = row.querySelectorAll("td")[0].innerText
                              .replace(line, "")
                              .replace(time, "")
                              .replace("-", "")
                              .trim()
                              .toLocaleLowerCase();
            newBuses.push(new Bus(time, line, remaining, destination));
          });

          resolve(newBuses);
        }, err => {
          console.log(err);
        });
    });
  }
}
