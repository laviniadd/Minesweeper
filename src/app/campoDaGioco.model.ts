import { Piastrella } from './piastrella.model';

export class CampoDaGioco {
    public campo: Piastrella[][];
    public height: number;
    public width: number;
    public mines: number;

    constructor(campo: Piastrella[][], height: number, width: number, mines: number) {
        this.campo = campo;
        // numero di righe
        this.height = height;
        // numero di colonne
        this.width = width;
        this.mines = mines;
    }
}
