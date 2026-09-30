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
import { Commune } from '../../../services/commune.interface';
import { CommandePublique } from '../../../services/commande-publique';
import { Division } from '../../../services/division.interface';
import { Periode } from '../selecteur-mois/periode.class';
import { MatProgressBar } from '@angular/material/progress-bar';
import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  imports: [MatProgressBar],
  providers: [DecimalPipe],
  selector: 'app-carte-commande-publique',
  styleUrl: './carte-commande-publique.sass',
  templateUrl: './carte-commande-publique.html',
})
export class CarteCommandePublique implements AfterViewInit {
  outputCommandePubliqueSelectionnee = output<Array<CommandePublique>>({
    alias: 'commandesPubliquesSelectionnees',
  });

  private referentiel = inject(Referentiel);
  private translate = inject(TranslateService);
  private decimalPipe = inject(DecimalPipe);

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
    this.initialiserCarte();
  }

  private initialiserCarte(): void {
    // 1. Définir les frontières géographiques de la France métropolitaine (Sud-Ouest et Nord-Est)
    const france = L.latLngBounds(
      L.latLng(41.3, -5.5), // Coin Sud-Ouest (proche de la frontière espagnole / océan)
      L.latLng(51.1, 10.0), // Coin Nord-Est (proche des frontières allemandes / belges)
    );

    // 2. Initialiser la carte avec les restrictions
    this.carte = L.map(this.conteneurCarte.nativeElement, {
      center: [46.2276, 2.2137], // Centré sur la France
      zoom: 6, // Zoom initial idéal pour la France
      minZoom: 6, // Empêche de dézoomer pour voir le monde entier
      maxZoom: 18, // Limite de zoom maximal pour voir les rues
      maxBounds: france, // Bloque le déplacement hors de cette zone
      maxBoundsViscosity: 1.0, // Effet "mur de briques" : rebondit immédiatement si on glisse hors de la zone
    });

    // 3. Charger le fond de carte OpenStreetMap (avec option pour éviter les duplications)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      noWrap: true, // Empêche la carte de se répéter indéfiniment à l'horizontale
      bounds: france, // Optimise le chargement en ne demandant que les tuiles de cette zone
    }).addTo(this.carte);

    this.groupeMarqueurs.addTo(this.carte);
  }

  public positionner(commune: Commune, rayon: number): void {
    this.carte.setZoom(rayon < 11 ? 12 : rayon < 26 ? 11 : 10);
    this.carte.setView([commune.latitude, commune.longitude]);

    const deltaLatitude = this.calculerDeltaLatitude(rayon);
    const deltaLongitude = this.calculerDeltaLongitude(rayon, commune);

    this.limitesGPS = {
      latitudeMinimum: commune.latitude - deltaLatitude,
      longitudeMinimum: commune.longitude - deltaLongitude,
      latitudeMaximum: commune.latitude + deltaLatitude,
      longitudeMaximum: commune.longitude + deltaLongitude,
    };

    const deltaLatitudeCarte = this.calculerDeltaLatitude(rayon * 1.1);
    const deltaLongitudeCarte = this.calculerDeltaLongitude(rayon * 1.1, commune);

    this.carte.setMaxBounds([
      [commune.latitude - deltaLatitudeCarte, commune.longitude - deltaLongitudeCarte],
      [commune.latitude + deltaLatitudeCarte, commune.longitude + deltaLongitudeCarte],
    ]);
  }

  private calculerDeltaLongitude(rayon: number, commune: Commune) {
    const latitudeRadians = commune.latitude * (Math.PI / 180);
    return rayon / (111.32 * Math.cos(latitudeRadians));
  }

  private calculerDeltaLatitude(rayon: number) {
    return (180 / Math.PI) * (rayon / 6371);
  }

  public placerMarqueursEntreprises(division: Division, procedure: string, periode: Periode): void {
    this.groupeMarqueurs.clearLayers();
    if (this.carte) {
      this.chargement.set(true);
      this.referentiel
        .commandesPubliques(this.limitesGPS!, division, procedure, periode)
        .subscribe({
          next: (commandesPubliques) => {
            commandesPubliques = this.limiterNbResultats(commandesPubliques);
            const commandesPubliquesParGps =
              this.grouperCommandesParCoordonnees(commandesPubliques);
            this.placerMarqueurs(commandesPubliquesParGps);
            this.chargement.set(false);
          },
          error: (erreur: HttpErrorResponse) => {
            alert(this.translate.instant('commun.erreur_http', { message: erreur.message }));
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

  private limiterNbResultats(commandesPubliques: Array<CommandePublique>) {
    if (commandesPubliques.length > 1000) {
      alert(
        this.translate.instant(
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
          icon: CarteCommandePublique.iconeMarqueur,
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
      return this.translate.instant(
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
