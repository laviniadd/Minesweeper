import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { GameService } from '../game.service';
import { CampoDaGioco } from '../campoDaGioco.model';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit {
  errornumeroDiMine = false;
  @Output() public childEventNewCampo = new EventEmitter();
  @Output() public childEventModifica = new EventEmitter();
  @Output() public childEventMineUnmarked = new EventEmitter();
  @Output() public childEventDisableMessaggi = new EventEmitter();
  @Output() public childEventRestartTimer = new EventEmitter();
  @Input() public campoDaGioco: CampoDaGioco;

  constructor(private gameservice: GameService) { }

  ngOnInit() {
  }
  onOk(altezza: number, larghezza: number, mine: number) {

    if ( mine < (altezza * larghezza)) {
      // creo il nuovo campo da gioco e passo al componente padre vari oggetti o booleani
      this.campoDaGioco = this.gameservice.startGame(+altezza, +larghezza, +mine);
      this.childEventNewCampo.emit(this.campoDaGioco);
      this.childEventMineUnmarked.emit(this.campoDaGioco.mines);
      this.childEventModifica.emit(false);
      this.childEventDisableMessaggi.emit();
    } else {
      this.errornumeroDiMine = true;
    }
  }
  onIndietro() {
    // faccio ripartire il timer e setto a false ngIf="modifica"
    this.childEventModifica.emit(false);
    this.childEventRestartTimer.emit();
  }

}
