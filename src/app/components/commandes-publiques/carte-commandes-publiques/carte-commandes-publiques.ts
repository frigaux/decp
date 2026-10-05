import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  output,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { Referentiel } from '../../../services/referentiel';
import { TranslateService } from '@ngx-translate/core';
import { LimitesGPS } from '../../../services/limites-gps.interface';
import * as L from 'leaflet';
import { CommandePublique } from '../../../services/commande-publique.interface';
import { Division } from '../../../services/division.interface';
import { Periode } from '../../communs/selecteur-mois/periode.class';
import { MatProgressBar } from '@angular/material/progress-bar';
import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Message } from '../../../services/message';
import { initialiserCarte, positionnerCarte } from '../../communs/Carte';
import { Commune } from '../../../services/commune.interface';

@Component({
  imports: [MatProgressBar],
  providers: [DecimalPipe],
  selector: 'app-carte-commandes-publiques',
  styleUrl: './carte-commandes-publiques.sass',
  templateUrl: './carte-commandes-publiques.html',
})
export class CarteCommandesPubliques implements AfterViewInit {
  outputCommandePubliqueSelectionnee = output<Array<CommandePublique>>({
    alias: 'commandesPubliquesSelectionnees',
  });

  private referentiel = inject(Referentiel);
  private translateService = inject(TranslateService);
  private decimalPipe = inject(DecimalPipe);
  private message = inject(Message);

  private limitesGPS?: LimitesGPS;

  @ViewChild('conteneurCarte') conteneurCarte!: ElementRef;
  private carte!: L.Map;
  private groupeMarqueurs = L.layerGroup();
  private static readonly iconeMarqueur = L.divIcon({
    className: 'fond-marqueur', // Classe CSS personnalisée
    html: '<div class="marqueur"></div>',
    iconSize: [20, 20], // Taille de l'élément
    iconAnchor: [10, 10], // Point d'ancrage central
  });

  // données pour la vue
  protected chargement: WritableSignal<boolean> = signal(false);

  ngAfterViewInit(): void {
    this.carte = initialiserCarte(this.groupeMarqueurs, this.conteneurCarte);
  }

  public positionner(commune: Commune, rayon: number): void {
    this.limitesGPS = positionnerCarte(this.carte, commune, rayon);
  }

  public placerMarqueursEntreprises(division: Division, procedure: string, periode: Periode): void {
    this.groupeMarqueurs.clearLayers();
    if (this.carte) {
      this.chargement.set(true);
      this.referentiel
        .commandesPubliques(this.limitesGPS!, division, procedure, periode)
        .subscribe({
          next: (commandesPubliques) => {
            if (commandesPubliques.length === 0) {
              this.message.afficher(this.translateService.instant('commun.aucun_resultat'));
            }
            commandesPubliques = this.limiterNbResultats(commandesPubliques);
            const commandesPubliquesParGps =
              this.grouperCommandesParCoordonnees(commandesPubliques);
            this.placerMarqueurs(commandesPubliquesParGps);
            this.chargement.set(false);
          },
          error: (erreur: HttpErrorResponse) => {
            this.message.afficher(
              this.translateService.instant('commun.erreur_http', { message: erreur.message }),
            );
          },
        });
    }
  }

  private grouperCommandesParCoordonnees(
    commandesPubliques: Array<CommandePublique>,
  ): Array<Array<CommandePublique>> {
    let cpParCoordonnees: Map<String, Array<CommandePublique>> = new Map();
    commandesPubliques.forEach((commandePublique) => {
      const key = `${commandePublique.lieuExecution.latitude}-${commandePublique.lieuExecution.longitude}`;
      if (!cpParCoordonnees.has(key)) {
        cpParCoordonnees.set(key, new Array<CommandePublique>());
      }
      cpParCoordonnees.get(key)?.push(commandePublique);
    });
    return [...cpParCoordonnees.values()];
  }

  private limiterNbResultats(commandesPubliques: Array<CommandePublique>): Array<CommandePublique> {
    if (commandesPubliques.length > 1000) {
      this.message.afficher(
        this.translateService.instant(
          'components.commandes_publiques.carte_commandes_publiques.trop_de_resultats',
          {
            nbCommandesPubliques: commandesPubliques.length,
          },
        ),
      );
      commandesPubliques = commandesPubliques
        .filter(
          (commandePublique) =>
            commandePublique.titulaires.find((titulaire) => !titulaire.titulaire.etablissement) ===
            undefined,
        )
        .slice(0, 1000);
    }
    return commandesPubliques;
  }

  private placerMarqueurs(commandesPubliquesParGps: Array<Array<CommandePublique>>) {
    commandesPubliquesParGps.forEach((commandesPubliques) => {
      let tooltip = this.tooltip(commandesPubliques);
      L.marker(
        [
          commandesPubliques[0].lieuExecution.latitude,
          commandesPubliques[0].lieuExecution.longitude,
        ],
        {
          icon: CarteCommandesPubliques.iconeMarqueur,
        },
      )
        .addTo(this.carte)
        .on('click', () => {
          this.outputCommandePubliqueSelectionnee.emit(commandesPubliques);
        })
        .addTo(this.groupeMarqueurs)
        .bindTooltip(tooltip, {
          permanent: true,
          offset: [10, 0],
          interactive: true,
        });
    });
  }

  private tooltip(commandesPubliques: Array<CommandePublique>) {
    if (commandesPubliques.length > 1) {
      return this.translateService.instant(
        'components.commandes_publiques.carte_commandes_publiques.plusieurs_commandes_publiques',
        {
          nbCommandesPubliques: commandesPubliques.length,
        },
      );
    } else {
      const premiereCP = commandesPubliques[0];
      let tooltip = `${this.decimalPipe.transform(premiereCP.montant)} €`;
      if (premiereCP.titulaires.length > 0 && premiereCP.titulaires[0].titulaire.etablissement) {
        tooltip = `${tooltip} - ${premiereCP.titulaires[0].titulaire.etablissement?.etablissement}`;
      }
      return tooltip;
    }
  }
}
