import { Component, inject, OnInit, signal, viewChild, WritableSignal } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { SelecteurCommune } from '../communs/selecteur-commune/selecteur-commune';
import { SelecteurDivision } from '../communs/selecteur-division/selecteur-division';
import { SelecteurMois } from '../communs/selecteur-mois/selecteur-mois';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Message } from '../../services/message';
import { Commune } from '../../services/commune.interface';
import { Division } from '../../services/division.interface';
import { Periode } from '../communs/selecteur-mois/periode.class';
import { CarteTitulaires } from './carte-titulaires/carte-titulaires';
import { Titulaire } from '../../services/titulaire.interface';
import { FicheTitulaire } from './fiche-titulaire/fiche-titulaire';

@Component({
  imports: [
    DatePipe,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelDescription,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    SelecteurCommune,
    SelecteurDivision,
    SelecteurMois,
    TranslatePipe,
    CarteTitulaires,
    FicheTitulaire,
  ],
  selector: 'app-titulaires',
  styleUrl: './titulaires.sass',
  templateUrl: './titulaires.html',
})
export class Titulaires implements OnInit {
  private translateService = inject(TranslateService);
  private message = inject(Message);

  private panneauSelecteurs = viewChild.required<MatExpansionPanel>('panneauSelecteurs');
  private panneauCarte = viewChild.required<MatExpansionPanel>('panneauCarte');

  private carteTitulaires = viewChild.required<CarteTitulaires>('carteTitulaires');
  private ficheTitulaire = viewChild.required<FicheTitulaire>('ficheTitulaire');

  private communeSelectionnee?: Commune;
  private rayonSelectionne?: number;

  // données pour la vue
  protected divisionSelectionnee: WritableSignal<Division | undefined> = signal(undefined);
  protected procedureSelectionnee: WritableSignal<string | undefined> = signal(undefined);
  protected periodeSelectionnee: WritableSignal<Periode | undefined> = signal(undefined);

  ngOnInit(): void {
    this.panneauSelecteurs().open();
    this.panneauCarte().close();
  }

  private afficherPanneauCarte() {
    if (
      this.communeSelectionnee &&
      this.rayonSelectionne &&
      this.periodeSelectionnee() &&
      this.divisionSelectionnee() &&
      this.procedureSelectionnee()
    ) {
      this.panneauSelecteurs().close();
      this.panneauCarte().open();
    }
  }

  protected chargerCarte() {
    if (
      this.communeSelectionnee &&
      this.rayonSelectionne &&
      this.periodeSelectionnee() &&
      this.divisionSelectionnee() &&
      this.procedureSelectionnee()
    ) {
      this.carteTitulaires().positionner(this.communeSelectionnee, this.rayonSelectionne);
      this.carteTitulaires().placerMarqueursTitulaires(
        this.divisionSelectionnee()!,
        this.procedureSelectionnee()!,
        this.periodeSelectionnee()!,
      );
      this.ficheTitulaire().reinitialiser();
    } else {
      this.message.afficher(
        this.translateService.instant('components.commandes_publiques.formulaire_invalide'),
      );
    }
  }

  protected definirCommune(commune: Commune) {
    this.communeSelectionnee = commune;
    this.afficherPanneauCarte();
  }

  protected definirRayon(rayon: number) {
    this.rayonSelectionne = rayon;
  }

  protected definirPeriode(periode: Periode) {
    this.periodeSelectionnee.set(periode);
  }

  protected definirDivision(division: Division) {
    this.divisionSelectionnee.set(division);
    this.afficherPanneauCarte();
  }

  protected definirProcedure(procedure: string) {
    this.procedureSelectionnee.set(procedure);
    this.afficherPanneauCarte();
  }

  protected afficherTitulaire(titulaire: Titulaire) {
    this.ficheTitulaire().afficher(titulaire);
  }
}
