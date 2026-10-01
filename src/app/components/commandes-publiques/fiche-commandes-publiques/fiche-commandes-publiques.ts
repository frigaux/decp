import { Component, signal, WritableSignal } from '@angular/core';
import { CommandePublique } from '../../../services/commande-publique.interface';
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
  selector: 'app-fiche-commandes-publiques',
  styleUrl: './fiche-commandes-publiques.sass',
  templateUrl: './fiche-commandes-publiques.html',
})
export class FicheCommandesPubliques {
  protected commandesPubliques: WritableSignal<Array<CommandePublique> | undefined> =
    signal(undefined);

  reinitialiser() {
    this.commandesPubliques.set(undefined);
  }

  afficher(commandesPubliques: Array<CommandePublique>): void {
    this.commandesPubliques.set(commandesPubliques);
  }
}
