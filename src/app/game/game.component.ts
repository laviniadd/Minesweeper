import { Component, OnInit } from '@angular/core';
import { GameService } from '../game.service';
import { Piastrella } from '../piastrella.model';
import { CampoDaGioco } from '../campoDaGioco.model';
import { timer, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],

})
export class GameComponent implements OnInit {
  stopTimer: Subject<void> = new Subject();
  mineUnmarked: number;
  messaggioHaiPerso = false;
  messaggioHaiVinto = false;
  campoDaGioco: CampoDaGioco;
  tempoDiGioco = 0;

  constructor(private gameservice: GameService) { }

  ngOnInit() {
     // azzero tempo e setto i messaggi a false
     this.restartVariables();
     // creo un nuovo campo
     this.campoDaGioco = this.gameservice.startGame(10, 10, 5);
     this.mineUnmarked = this.campoDaGioco.mines;
  }

  onStartNewGame() {
    // azzero tempo e setto i messaggi a false
    this.restartVariables();
    // creo un nuovo campo
    this.campoDaGioco = this.gameservice.startGame(this.campoDaGioco.height, this.campoDaGioco.width, this.campoDaGioco.mines);
    this.mineUnmarked = this.campoDaGioco.mines;
  }

  onClickSuPiastrella(piastrellacliccata: Piastrella) {
    // al primo click faccio partire il timer
    if (this.tempoDiGioco === 0) {
      this.startTimer();
    }

    // controllo se la piastrella cliccata abbia una bandiera, se ha la bamdiera non succede nulla
    if (!piastrellacliccata.hasBandiera) {
      // controllo se la piastrella cliccata abbia una bomba, se c'è il gioco fine. Hai Perso!
      if (piastrellacliccata.hasBomba) {
            this.messaggioHaiPerso = true;
            piastrellacliccata.testoSulBottone = 'X';
            this.gameservice.mostraTutteLeBombe(this.campoDaGioco);
            // viene chiamata per fermare il timer
            this.stopTimer.next();
          } else {
            // calcolo il numero di bombe della piastrella cliccata
            this.gameservice.calcolaNumeroBombeVicine(piastrellacliccata, this.campoDaGioco);
            // se la piastrella ha 0 bombe vicino allora deve effettuare una ricerca(simile a breath first search)
            if ( piastrellacliccata.numeroBombeVicino === 0) {
              this.gameservice.ricerca(piastrellacliccata, this.campoDaGioco);
            }
            // faccio apparire il numero di bombe a video
            piastrellacliccata.testoSulBottone = String(piastrellacliccata.numeroBombeVicino);
            // rendo il tasto non più cliccabile
            piastrellacliccata.isClickable = false;
            this.gameservice.aggiungiPiastrellaAperta(piastrellacliccata);
          }
          // controllo se l'utente ha vinto
          this.messaggioHaiVinto = this.gameservice.controlloVittoria(this.campoDaGioco);
          if (this.messaggioHaiVinto) {
            // viene chiamata per fermare il timer
            this.stopTimer.next();
          }
    }
  }

  // il rightClick fa comparire la B (che indica la bandiera) sulla piastrella cliccata
  // e punto(.) se è già bandiera
  onRightClick(piastrella: Piastrella) {
    if (this.tempoDiGioco === 0) {
      this.startTimer();
    }
    if (!piastrella.hasBandiera) {
      this.mineUnmarked--;
      piastrella.hasBandiera = true;
    } else {
      piastrella.testoSulBottone = '';
      this.mineUnmarked++;
      piastrella.hasBandiera = false;
    }
    // serve per non far comparire la finestra che viene attivata di default sul browser, dal rightClick
    return false;
  }

  pauseTimer() {
    // blocco il timer
    this.stopTimer.next();
  }
  restartTimer() {
    // faccio partire il timer dal punto in cui lo avevo fermato e non partendo da zero
    if (this.tempoDiGioco !== 0) {
      timer(1000, 1000).pipe(
        takeUntil(this.stopTimer),
      ).subscribe(() => this.tempoDiGioco = this.tempoDiGioco + 1 );
    }
  }
  restartVariables() {
     // azzero tempo e setto i messaggi a false
     this.stopTimer.next();
     this.tempoDiGioco = 0;
     this.messaggioHaiVinto = false;
     this.messaggioHaiPerso = false;
  }

  startTimer() {
      timer(100, 1000).pipe(
        takeUntil(this.stopTimer),
      ).subscribe(val => this.tempoDiGioco = val + 1 );
  }
}
