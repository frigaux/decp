import { Component, inject, OnInit, output, signal, WritableSignal } from '@angular/core';
import { Referentiel } from '../../../services/referentiel';
import { Commune } from '../../../services/commune.interface';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import { MatProgressBar } from '@angular/material/progress-bar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { MatIcon } from '@angular/material/icon';
import { form, FormField } from '@angular/forms/signals';
import { Formulaire } from './formulaire';

@Component({
  imports: [
    MatFormField,
    MatLabel,
    MatAutocompleteTrigger,
    MatAutocomplete,
    MatOption,
    MatProgressBar,
    ReactiveFormsModule,
    MatInput,
    TranslatePipe,
    MatSlider,
    MatSliderThumb,
    FormsModule,
    MatIcon,
    FormField,
  ],
  selector: 'app-selecteur-commune',
  styleUrl: './selecteur-commune.sass',
  templateUrl: './selecteur-commune.html',
})
export class SelecteurCommune implements OnInit {
  outputCommune = output<Commune>({ alias: 'communeSelectionnee' });
  outputRayon = output<number>({ alias: 'rayonSelectionne' });

  private referentiel = inject(Referentiel);

  // données pour la vue
  protected chargement: WritableSignal<boolean> = signal(true);
  public readonly communes: WritableSignal<Array<Commune>> = signal<Array<Commune>>([]);
  protected readonly communesFiltrees: WritableSignal<Array<Commune>> = signal<Array<Commune>>([]);
  protected icone: WritableSignal<string> = signal('error');

  // formulaire
  modeleFormulaire = signal<Formulaire>({
    champRechercheCommune: '',
    rayon: 25,
  });

  protected readonly formulaire = form(this.modeleFormulaire);

  ngOnInit(): void {
    this.outputRayon.emit(this.modeleFormulaire().rayon);
    this.referentiel.communes().subscribe((communes) => {
      this.communes.set(communes);
      this.chargement.set(false);
    });
  }

  filtrerCommunes(chaine: string): void {
    if (typeof chaine === 'string') {
      const chaineNormalisee = this.referentiel.normaliser(chaine);
      const communesFiltrees = this.communes().filter(
        (commune) =>
          commune.nomNormalise.includes(chaineNormalisee) ||
          commune.codePostal.startsWith(chaineNormalisee),
      );
      if (communesFiltrees.length < 200) {
        this.communesFiltrees.set(communesFiltrees);
      }
    }
  }

  protected rayonModifie() {
    this.outputRayon.emit(this.modeleFormulaire().rayon);
  }

  protected communeModifiee() {
    const o = this.modeleFormulaire().champRechercheCommune;
    if (typeof o === 'string') {
      this.filtrerCommunes(this.modeleFormulaire().champRechercheCommune);
      this.icone.set('error');
    }
  }

  protected communeSelectionnee() {
    const o = this.modeleFormulaire().champRechercheCommune;
    if (typeof o === 'object') {
      this.outputCommune.emit(o);
      this.icone.set('check');
    }
  }
}
