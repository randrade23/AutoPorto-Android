import { TranslateService } from "@ngx-translate/core";

export class Stop {
    title : string = "";
    buses : Bus[] = [];
    isRefreshing : boolean = true;
    isNotifying : boolean = false;

    constructor(title : string) {
        this.title = title;
    }

    toNotificationString(translate: TranslateService) : Promise<string> {
        let promise : Promise<string> = new Promise((resolve, reject) => {
            translate.get('noBusShortWarning').toPromise().then((warning : any) => {
                let buses = this.buses.map((value : Bus) => {
                    return value.toNotificationString();
                }).join(", ");
        
                if (buses == "") {
                    buses = warning;
                }
        
                resolve(`${this.title} - ${buses}`);
            });
        }); 

        return promise;
    }
}

export class Bus {
    line : string = "";
    time : string = "";
    destination : string = "";
    color : Color = Color.Default;

    constructor (time : string, line : string, destination : string) {
        this.line = line;
        this.time = time;
        this.destination = destination;

        if (line.match(/M/i)) {
            this.color = Color.Black;
        }
        else if (line.startsWith("5")) {
            this.color = Color.Yellow;
        }
        else if (line.startsWith("6")) {
            this.color = Color.Green;
        }
        else if (line.startsWith("7")) {
            this.color = Color.Red;
        }
        else if (line.startsWith("8")) {
            this.color = Color.Purple;
        }
        else if (line.startsWith("9")) {
            this.color = Color.Orange;
        }
    }

    getColor() : string {
        var R = this.color / (256*256);
        var G = (this.color / 256) % 256;
        var B = this.color % 256;
        return `rgb(${R}, ${G}, ${B})`;
    }

    toNotificationString() : string {
        return `${this.line} - ${this.time}`;
    }
}

export enum Color {
    Default = 0x0073ff,
    Yellow = 0xffd000,
    Green = 0x00bf1d,
    Red = 0xbf0000,
    Purple = 0x7900bf,
    Orange = 0xbf7300,
    Black = 0x000000
}

export class STCPStop {
    code : string;
    name : string;
    zone : string;
    lines : any[];
    geomdesc : Geometry;
    mode: number;
    address: string;
}

export class Geometry {
    type : string;
    coordinates: number[]
}

export class Distance {
    code : string;
    distance : number;

    constructor (c: string, d: number) {
        this.code = c;
        this.distance = d;
    }
}