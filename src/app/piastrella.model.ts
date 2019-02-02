export class Piastrella {
    public riga: number;
    public colonna: number;
    public numeroBombeVicino: number;
    public testoSulBottone: string;
    public hasBomba: boolean;
    public isClickable: boolean;
    public hasBandiera: boolean;

    constructor(
        riga: number, colonna: number, numeroBombeVicino: number,
         testoSulBottone: string,  hasBomba: boolean, isClickable: boolean, hasBandiera: boolean) {
        this.riga = riga;
        this.colonna = colonna;
        this.numeroBombeVicino = numeroBombeVicino;
        this.testoSulBottone = testoSulBottone;
        this.hasBomba = hasBomba;
        this.isClickable = isClickable;
        this.hasBandiera = hasBandiera;
    }
}
