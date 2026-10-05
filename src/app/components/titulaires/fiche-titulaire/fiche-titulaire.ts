import { Component, signal, WritableSignal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { Titulaire } from '../../../services/titulaire.interface';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';

@Component({
  imports: [
    CurrencyPipe,
    DatePipe,
    TranslatePipe,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
  ],
  selector: 'app-fiche-titulaire',
  styleUrl: './fiche-titulaire.sass',
  templateUrl: './fiche-titulaire.html',
})
export class FicheTitulaire {
  protected titulaire: WritableSignal<Titulaire | undefined> = signal(undefined);

  reinitialiser() {
    this.titulaire.set(undefined);
  }

  afficher(titulaire: Titulaire): void {
    this.titulaire.set(titulaire);
  }
}
