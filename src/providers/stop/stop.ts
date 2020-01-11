import { HTTP } from '@ionic-native/http';

import { Injectable } from '@angular/core';

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
        .then(data => {
          resolve(data);
        }, err => {
          console.log(err);
        });
    });
  }
}
