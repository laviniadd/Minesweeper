import { Injectable } from '@angular/core';
import { Piastrella } from './piastrella.model';
import { CampoDaGioco } from './campoDaGioco.model';

@Injectable()
export class GameService {
   // campoDaGioco: CampoDaGioco;
    piastrelleAperte: Piastrella[] = [];

    constructor() {}

    startGame(height: number, width: number, mines: number) {
        const campo: Piastrella[][] = [];

        let piastrella: Piastrella;
        let riga: Piastrella[];
        // costruisco il campo da gioco aggiungendo ad ogni riga una piastrella cliccabile senza bombe e senza bandiera
        // per ogni piastrella setto i,j che è la posizione nel campo da gioco
        for (let i = 0; i < height; i++) {
            riga = [];
            for (let j = 0; j < width; j++) {
                piastrella = new Piastrella(i, j, 0, '', false, true, false);
                riga.push(piastrella);
            }
            campo.push(riga);
        }

        // posiziona le bombe sul campo scegliendo a caso una riga e una colonna
        let bombeInserite = 0;
        while (bombeInserite < mines) {
            const rigaRandom = this.getRandomInt(0, height);
            const colonnaRandom = this.getRandomInt(0, width);
            // controllo che la piastrella non abbia già una bomba assegnata
            if (campo[rigaRandom][colonnaRandom].hasBomba === false) {
                campo[rigaRandom][colonnaRandom].hasBomba = true;
                bombeInserite++;
            }
        }
        this.piastrelleAperte = [];
        const campoDaGioco: CampoDaGioco = new CampoDaGioco(campo, height, width, mines);
        return campoDaGioco;
    }

    getRandomInt(min: number, max: number) {
        return Math.floor(Math.random() * max) + min;
    }

    // gli passo la piastrella di cui devo calcolare il numero di bombe nelle vicinanze
    calcolaNumeroBombeVicine (piastrella: Piastrella, campoDaGioco: CampoDaGioco) {
        const i = piastrella.riga;
        const j = piastrella.colonna;
        const  start = Math.max(0, i - 1);
        const end  = Math.min(i + 1, campoDaGioco.height - 1);
        const inizio = Math.max(0, j - 1);
        const fine  = Math.min(j + 1, campoDaGioco.width - 1);
        let bombeVicine = 0;
        // controllo che i vicini della piastrella che ho ricevuto siamo una bomba,
        // se si: aumento il contatore altrimenti passo a quella dopo
        for (let k = start; k <= end; k++) {
            for (let p = inizio; p <= fine; p++) {
                if (campoDaGioco.campo[k][p].hasBomba) {
                    bombeVicine++;
                }
            }
        }
        // setto quante bombe vicine ha la piastrella che ho ricevuto
        piastrella.numeroBombeVicino = bombeVicine;
    }

    // ricerca(simile a breath first search)
    ricerca (piastrella: Piastrella, campoDaGioco: CampoDaGioco) {
        let vicini: Piastrella[] = [];
        const piastrelleVisitate: Piastrella[] = [];
        const coda: Piastrella[] = [];
        // inserisco la piastrella nella coda delle piastrelle su cui devo effettuare la ricerca
        coda.push(piastrella);
        piastrelleVisitate.push(piastrella);
        this.aggiungiPiastrellaAperta(piastrella);

        while (coda.length !== 0) {
        // prendo la prima piastrella su cui devo effettuare la ricerca
        const piastrellaInCoda = coda.shift();
        // setto l'array che contiene i vicini della piastrella
        vicini = this.trovaVicini(piastrellaInCoda, campoDaGioco);

            while (!(vicini.length === 0)) {
                let piastrellaSingolaVicina: Piastrella;
                piastrellaSingolaVicina = vicini.shift();
                // se la piastrella non ha la bandiera fa comparire il numero di bombe e la rende non cliccabile
                if (!piastrellaSingolaVicina.hasBandiera) {
                    this.aggiungiPiastrellaAperta(piastrellaSingolaVicina);
                    piastrellaSingolaVicina.testoSulBottone = String(piastrellaSingolaVicina.numeroBombeVicino);
                    piastrellaSingolaVicina.isClickable = false;
                    // se la piastrella ha 0 bombe e non è stata visitata la mette nella coda della ricerca
                    if ( piastrellaSingolaVicina.numeroBombeVicino === 0 && !piastrelleVisitate.includes(piastrellaSingolaVicina)) {
                        coda.push(piastrellaSingolaVicina);
                    }
                    // e la aggiunge alla lista delle caselle visitate
                    piastrelleVisitate.push(piastrellaSingolaVicina);
                }
            }
        }
        this.controlloVittoria(campoDaGioco);
    }

    // permette di trovare i vicini della piastrella passata nel metodo trovaVicini
    trovaVicini(piastrella: Piastrella, campoDaGioco: CampoDaGioco) {
        const i = piastrella.riga;
        const j = piastrella.colonna;
        const piastrelleVicine: Piastrella[] = [];
        const  start = Math.max(0, i - 1);
        const end  = Math.min(i + 1, campoDaGioco.height - 1);
        const inizio = Math.max(0, j - 1);
        const fine  = Math.min(j + 1, campoDaGioco.width - 1);
        for (let k = start; k <= end; k++) {
            for (let p = inizio; p <= fine; p++) {
            // con questo if escludo la piastrella di cui cerco i vicini dalla lista dei vicini
                if ( !(k === i && p === j)) {
                    // per ogni vicino calcolo il numero di bombe
                    this.calcolaNumeroBombeVicine(campoDaGioco.campo[k][p], campoDaGioco);
                    piastrelleVicine.push(campoDaGioco.campo[k][p]);
                }
            }
        }
        return piastrelleVicine;
    }

    // controlla che il numero di piastrelle gestite (aperte) è uguale al numero di caselle da aprire per vincere
    controlloVittoria(campoDaGioco: CampoDaGioco) {
        const numeroPiastrelleAperte = this.piastrelleAperte.length;
        const numeroDiPiastrelleDaAprirePerVincere =
        (campoDaGioco.height * campoDaGioco.width) - campoDaGioco.mines;
        if (numeroPiastrelleAperte === numeroDiPiastrelleDaAprirePerVincere) {
            this.mostraTutteLeBombe(campoDaGioco);
            return true;
        }
    }

    // aggiungo la piastrella che è stata gestita (aperta)
    aggiungiPiastrellaAperta(piastrella: Piastrella) {
        // controllo che la piastrella non sia già stata inserita
        if (!this.piastrelleAperte.includes(piastrella)) {
          this.piastrelleAperte.push(piastrella);
        }
    }
    // cerca tutte le bombe e le mostra
    mostraTutteLeBombe(campoDaGioco: CampoDaGioco) {
        for (let i = 0; i < campoDaGioco.height; i++) {
            for (let j = 0; j < campoDaGioco.width; j++) {
                if (campoDaGioco.campo[i][j].hasBomba && !campoDaGioco.campo[i][j].hasBandiera) {
                    campoDaGioco.campo[i][j].testoSulBottone = 'X';
                }
            }
        }
    }

}
