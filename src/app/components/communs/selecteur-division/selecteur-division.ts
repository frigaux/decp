import { Component, inject, OnInit, output, signal, WritableSignal } from '@angular/core';
import { Division } from '../../../services/division.interface';
import { Referentiel } from '../../../services/referentiel';
import { Formulaire } from './formulaire';
import { form, FormField } from '@angular/forms/signals';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { MatOption, MatSelect } from '@angular/material/select';
import { NgClass } from '@angular/common';

@Component({
  imports: [
    MatProgressBar,
    MatFormField,
    MatLabel,
    FormField,
    MatIcon,
    TranslatePipe,
    MatInput,
    MatSelect,
    MatOption,
    NgClass,
  ],
  selector: 'app-selecteur-division',
  styleUrl: './selecteur-division.sass',
  templateUrl: './selecteur-division.html',
})
export class SelecteurDivision implements OnInit {
  outputDivision = output<Division>({ alias: 'divisionSelectionnee' });
  outputProcedure = output<string>({ alias: 'procedureSelectionnee' });

  private referentiel = inject(Referentiel);

  private _divisions?: Array<Division>;

  // données pour la vue
  protected chargement: WritableSignal<boolean> = signal(true);
  public readonly divisions: WritableSignal<Array<Division>> = signal([]);
  public static readonly PROCEDURES = [
    'Toutes',
    'Procédure adaptée',
    'Procédure avec négociation',
    'Marché passé sans publicité ni mise en concurrence préalable',
    'Dialogue compétitif',
    "Appel d'offres restreint",
    "Appel d'offres ouvert",
  ];
  protected procedures = SelecteurDivision.PROCEDURES;

  // formulaire
  modeleFormulaire = signal<Formulaire>({
    champRechercheDivision: '',
    procedure: SelecteurDivision.PROCEDURES[0],
  });

  protected readonly formulaire = form(this.modeleFormulaire);

  ngOnInit(): void {
    this.outputProcedure.emit(SelecteurDivision.PROCEDURES[0]);
    this.referentiel.divisions().subscribe((divisions) => {
      this._divisions = divisions;
      this.divisions.set(JSON.parse(JSON.stringify(divisions)));
      this.chargement.set(false);
    });
  }

  protected filtrer() {
    const recherche = this.modeleFormulaire().champRechercheDivision;
    if (this._divisions) {
      this.divisions.set(this._filtrer(recherche, JSON.parse(JSON.stringify(this._divisions))));
    }
  }

  private _filtrer(recherche: string, divisions: Array<Division>): Array<Division> {
    const resultat: Array<Division> = [];
    const rechercheNormalisee = this.referentiel.normaliser(recherche);
    divisions.forEach((division: Division) => {
      const idx = division.libelleNormalise.indexOf(rechercheNormalisee);
      if (idx !== -1) {
        const libelle = division.libelle;
        const lg = idx + recherche.length;
        division.libelle = `${libelle.substring(0, idx)}<strong>${libelle.substring(idx, lg)}</strong>${libelle.substring(lg, libelle.length)}`;
        resultat.push(division);
      }
    });
    return resultat;
  }

  protected reinitialiser() {
    this.modeleFormulaire.set({
      champRechercheDivision: '',
      procedure: '',
    });
    if (this._divisions) {
      this.divisions.set(JSON.parse(JSON.stringify(this._divisions)));
    }
  }

  protected divisionSelectionnee(division: Division) {
    this.divisions().forEach((division: Division) => {
      division.selectionne = false;
    });
    division.selectionne = true;
    this.outputDivision.emit(division);
  }

  protected procedureSelectionnee(e: any) {
    this.outputProcedure.emit(e.value);
  }
}
