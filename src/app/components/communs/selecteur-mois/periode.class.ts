import { Mois } from './mois.class';

export class Periode {
  debut: string;
  fin: string;

  constructor(debut: Mois, fin: Mois) {
    this.debut = debut.date.toISOString().substring(0, 10);
    this.fin = fin.date.toISOString().substring(0, 10);
  }
}
