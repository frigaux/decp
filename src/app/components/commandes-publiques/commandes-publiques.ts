import { Component, inject, OnInit, signal, viewChild, WritableSignal } from '@angular/core';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SelecteurCommune } from '../communs/selecteur-commune/selecteur-commune';
import { Commune } from '../../services/commune.interface';
import { SelecteurMois } from '../communs/selecteur-mois/selecteur-mois';
import { Periode } from '../communs/selecteur-mois/periode.class';
import { SelecteurDivision } from '../communs/selecteur-division/selecteur-division';
import { Division } from '../../services/division.interface';
import { CarteCommandesPubliques } from './carte-commandes-publiques/carte-commandes-publiques';
import { CommandePublique } from '../../services/commande-publique.interface';
import { FicheCommandesPubliques } from './fiche-commandes-publiques/fiche-commandes-publiques';
import { DatePipe } from '@angular/common';
import { Message } from '../../services/message';
import { Router } from '@angular/router';

@Component({
  imports: [
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    TranslatePipe,
    SelecteurCommune,
    SelecteurMois,
    SelecteurDivision,
    MatExpansionPanelDescription,
    CarteCommandesPubliques,
    FicheCommandesPubliques,
    DatePipe,
  ],
  selector: 'app-commandes-publiques',
  styleUrl: './commandes-publiques.sass',
  templateUrl: './commandes-publiques.html',
})
export class CommandesPubliques implements OnInit {
  private translateService = inject(TranslateService);
  private message = inject(Message);
  private router = inject(Router);

  private panneauSelecteurs = viewChild.required<MatExpansionPanel>('panneauSelecteurs');
  private panneauCarte = viewChild.required<MatExpansionPanel>('panneauCarte');

  private carteCommandesPubliques =
    viewChild.required<CarteCommandesPubliques>('carteCommandesPubliques');
  private ficheCommandePublique =
    viewChild.required<FicheCommandesPubliques>('ficheCommandesPubliques');

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
      this.carteCommandesPubliques().positionner(this.communeSelectionnee, this.rayonSelectionne);
      this.carteCommandesPubliques().placerMarqueursEntreprises(
        this.divisionSelectionnee()!,
        this.procedureSelectionnee()!,
        this.periodeSelectionnee()!,
      );
      this.ficheCommandePublique().reinitialiser();
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

  protected afficherCommandesPubliques(commandesPubliques: Array<CommandePublique>) {
    this.ficheCommandePublique().afficher(commandesPubliques);
  }

  protected vueTitulaire() {
    this.router.navigateByUrl('/titulaires');
  }
}
