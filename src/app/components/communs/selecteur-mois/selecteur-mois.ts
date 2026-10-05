import { Component, Input, output, signal, WritableSignal } from '@angular/core';
import { Bornes } from './bornes.interface';
import { Periode } from './periode.class';
import { DatePipe, NgClass } from '@angular/common';
import { Mois } from './mois.class';
import { MatIcon } from '@angular/material/icon';

@Component({
  imports: [DatePipe, NgClass, MatIcon],
  selector: 'app-selecteur-mois',
  styleUrl: './selecteur-mois.sass',
  templateUrl: './selecteur-mois.html',
})
export class SelecteurMois {
  outputPeriode = output<Periode>({ alias: 'periodeSelectionnee' });

  // données pour la vue
  listeMois: WritableSignal<Array<Mois>> = signal<Array<Mois>>([]);
  protected icone: WritableSignal<string> = signal('error');

  private debut?: Mois;
  private fin?: Mois;

  @Input({ alias: 'bornes' })
  set value(o: unknown) {
    if (o) {
      const bornes = o as Bornes;
      let date = new Date(bornes.minimum);
      const mois = [new Mois(new Date(date))];
      while (date.getTime() != new Date(bornes.maximum).getTime()) {
        date.setMonth(date.getMonth() + 1);
        mois.push(new Mois(new Date(date)));
      }
      this.listeMois.set(mois);
    }
  }

  protected gererClic(mois: Mois) {
    mois.selectionne = !mois.selectionne;
    if (mois.selectionne) {
      if (!this.debut) {
        this.debut = mois;
        this.outputPeriode.emit(new Periode(this.debut, this.debut));
        this.icone.set('check');
      } else if (!this.fin && this.debut.date < mois.date) {
        this.fin = mois;
        this.listeMois().forEach((mois) => {
          if (mois.date > this.debut!.date && mois.date < this.fin!.date) {
            mois.selectionne = true;
          }
        });
        this.outputPeriode.emit(new Periode(this.debut, this.fin));
        this.icone.set('check');
      } else {
        this.debut = mois;
        this.fin = undefined;
        this.listeMois().forEach((m) => {
          if (m != mois) {
            m.selectionne = false;
          }
        });
        this.outputPeriode.emit(new Periode(this.debut, this.debut));
        this.icone.set('check');
      }
    } else {
      this.listeMois().forEach((mois) => (mois.selectionne = false));
    }
  }
}
