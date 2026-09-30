import { Component, signal, WritableSignal } from '@angular/core';
import { CommandePublique } from '../../../services/commande-publique';
import { TranslatePipe } from '@ngx-translate/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';

@Component({
  imports: [
    TranslatePipe,
    DatePipe,
    CurrencyPipe,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
  ],
  selector: 'app-fiche-commande-publique',
  styleUrl: './fiche-commande-publique.sass',
  templateUrl: './fiche-commande-publique.html',
})
export class FicheCommandePublique {
  protected commandesPubliques: WritableSignal<Array<CommandePublique> | undefined> =
    signal(undefined);

  reinitialiser() {
    this.commandesPubliques.set(undefined);
  }

  afficher(commandesPubliques: Array<CommandePublique>): void {
    this.commandesPubliques.set(commandesPubliques);
  }
}
