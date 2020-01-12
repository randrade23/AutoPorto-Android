export class Stop {
    title : string = "";
    buses : Bus[] = [];
    isRefreshing : boolean = true;

    constructor(title : string) {
        this.title = title;
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