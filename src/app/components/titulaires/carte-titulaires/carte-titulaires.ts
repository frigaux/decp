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
import { MatProgressBar } from '@angular/material/progress-bar';
import { Referentiel } from '../../../services/referentiel';
import { TranslateService } from '@ngx-translate/core';
import { DecimalPipe } from '@angular/common';
import { Message } from '../../../services/message';
import { LimitesGPS } from '../../../services/limites-gps.interface';
import * as L from 'leaflet';
import { Titulaire } from '../../../services/titulaire.interface';
import { initialiserCarte, positionnerCarte } from '../../communs/Carte';
import { Division } from '../../../services/division.interface';
import { Periode } from '../../communs/selecteur-mois/periode.class';
import { HttpErrorResponse } from '@angular/common/http';
import { Commune } from '../../../services/commune.interface';

@Component({
  imports: [MatProgressBar],
  providers: [DecimalPipe],
  selector: 'app-carte-titulaires',
  styleUrl: './carte-titulaires.sass',
  templateUrl: './carte-titulaires.html',
})
export class CarteTitulaires implements AfterViewInit {
  outputTitulaireSelectionne = output<Titulaire>({
    alias: 'titulaireSelectionne',
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

  public placerMarqueursTitulaires(division: Division, procedure: string, periode: Periode): void {
    this.groupeMarqueurs.clearLayers();
    if (this.carte) {
      this.chargement.set(true);
      this.referentiel.titulaires(this.limitesGPS!, division, procedure, periode).subscribe({
        next: (titulaires) => {
          if (titulaires.length === 0) {
            this.message.afficher(this.translateService.instant('commun.aucun_resultat'));
          }
          titulaires = this.limiterNbResultats(titulaires);
          this.placerMarqueurs(titulaires);
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

  private limiterNbResultats(titulaires: Array<Titulaire>): Array<Titulaire> {
    if (titulaires.length > 1000) {
      this.message.afficher(
        this.translateService.instant('components.titulaires.carte_titulaires.trop_de_resultats', {
          nbCommandesPubliques: titulaires.length,
        }),
      );
      titulaires = titulaires
        .filter((titulaire) => titulaire.etablissement?.codeEffectif !== 'NN')
        .slice(0, 1000);
    }
    return titulaires;
  }

  private placerMarqueurs(titulaires: Array<Titulaire>) {
    titulaires.forEach((titulaire) => {
      if (
        titulaire.etablissement &&
        titulaire.etablissement.latitude &&
        titulaire.etablissement.longitude
      ) {
        const etablissement = titulaire.etablissement;
        L.marker([etablissement.latitude!, etablissement.longitude!], {
          icon: CarteTitulaires.iconeMarqueur,
        })
          .addTo(this.carte)
          .on('click', () => {
            this.outputTitulaireSelectionne.emit(titulaire);
          })
          .addTo(this.groupeMarqueurs)
          .bindTooltip(etablissement.etablissement, {
            permanent: true,
            offset: [10, 0],
            interactive: true,
          });
      }
    });
  }
}
