import { inject, Service } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, Observer } from 'rxjs';
import { environment } from '../../environments/environment';
import { Commune } from './commune.interface';
import { Division } from './division.interface';
import { LimitesGPS } from './limites-gps.interface';
import { Periode } from '../components/communs/selecteur-mois/periode.class';
import { CommandePublique } from './commande-publique.interface';
import { SelecteurDivision } from '../components/communs/selecteur-division/selecteur-division';
import { Titulaire } from './titulaire.interface';

@Service()
export class Referentiel {
  private http = inject(HttpClient);
  private static readonly effectifParCode: any = {
    NN: "pas de salarié au cours de l'année de référence et pas d'effectif au 31/12",
    '00': '0',
    '01': '1 ou 2 salariés',
    '02': '3 à 5 salariés',
    '03': '6 à 9 salariés',
    '11': '10 à 19 salariés',
    '12': '20 à 49 salariés',
    '21': '50 à 99 salariés',
    '22': '100 à 199 salariés',
    '31': '200 à 249 salariés',
    '32': '250 à 499 salariés',
    '41': '500 à 999 salariés',
    '42': '1 000 à 1 999 salariés',
    '51': '2 000 à 4 999 salariés',
    '52': '5 000 à 9 999 salariés',
    '53': '10 000 salariés et plus',
  };

  public normaliser(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  public communes(): Observable<Array<Commune>> {
    return new Observable((observer: Observer<Array<Commune>>) => {
      this.http
        .get<Array<Commune>>(`${environment.urlReferentiel}/communesFrance2026.json`)
        .subscribe({
          next: (communes) => {
            communes.forEach((commune) => {
              commune.nomNormalise = this.normaliser(commune.nom);
            });
            observer.next(communes);
          },
          error: (erreur: HttpErrorResponse) => {
            observer.error(erreur);
          },
        });
    });
  }

  public divisions(): Observable<Array<Division>> {
    return new Observable((observer: Observer<Array<Division>>) => {
      this.http
        .get<{ string: string }>(`${environment.urlReferentiel}/divisionsCPV.json`)
        .subscribe({
          next: (divisions) => {
            observer.next(
              Object.entries(divisions).map(([code, libelle]) => {
                const libelleNormalise = this.normaliser(libelle);
                return { code, libelle, libelleNormalise };
              }),
            );
          },
          error: (erreur: HttpErrorResponse) => {
            observer.error(erreur);
          },
        });
    });
  }

  public commandesPubliques(
    limitesGPS: LimitesGPS,
    division: Division,
    procedure: string,
    periode: Periode,
  ): Observable<Array<CommandePublique>> {
    return new Observable((observer: Observer<Array<CommandePublique>>) => {
      this.http
        .get<Array<CommandePublique>>(`${environment.urlReferentiel}/${division.code}.json`)
        .subscribe({
          next: (commandesPubliques) => {
            commandesPubliques = this.filtrerCommandesPubliques(
              commandesPubliques,
              procedure,
              periode,
              limitesGPS,
            );
            observer.next(commandesPubliques);
          },
          error: (erreur: HttpErrorResponse) => {
            observer.error(erreur);
          },
        });
    });
  }

  private filtrerCommandesPubliques(
    commandesPubliques: Array<CommandePublique>,
    procedure: string,
    periode: Periode,
    limitesGPS: LimitesGPS,
  ) {
    commandesPubliques = commandesPubliques.filter(
      (commandePublique) =>
        (procedure === SelecteurDivision.PROCEDURES[0] ||
          commandePublique.procedure === procedure) &&
        commandePublique.dateNotification >= periode.debut &&
        commandePublique.dateNotification <= periode.fin &&
        limitesGPS.latitudeMinimum < commandePublique.lieuExecution.latitude &&
        limitesGPS.longitudeMinimum < commandePublique.lieuExecution.longitude &&
        limitesGPS.latitudeMaximum > commandePublique.lieuExecution.latitude &&
        limitesGPS.longitudeMaximum > commandePublique.lieuExecution.longitude,
    );
    commandesPubliques.forEach((commandePublique) => {
      commandePublique.titulaires.forEach((titulaire) => {
        const etablissement = titulaire.titulaire.etablissement;
        if (etablissement) {
          etablissement.effectif = Referentiel.effectifParCode[etablissement.codeEffectif];
        }
      });
    });
    return commandesPubliques;
  }

  public titulaires(
    limitesGPS: LimitesGPS,
    division: Division,
    procedure: string,
    periode: Periode,
  ): Observable<Array<Titulaire>> {
    return new Observable((observer: Observer<Array<Titulaire>>) => {
      this.http
        .get<Array<CommandePublique>>(`${environment.urlReferentiel}/${division.code}.json`)
        .subscribe({
          next: (commandesPubliques) => {
            commandesPubliques = this.filtrerTitulaires(
              commandesPubliques,
              procedure,
              periode,
              limitesGPS,
            );
            observer.next(this.transformerEnTitulaires(commandesPubliques));
          },
          error: (erreur: HttpErrorResponse) => {
            observer.error(erreur);
          },
        });
    });
  }

  private filtrerTitulaires(
    commandesPubliques: Array<CommandePublique>,
    procedure: string,
    periode: Periode,
    limitesGPS: LimitesGPS,
  ) {
    commandesPubliques = commandesPubliques.filter((commandePublique) => {
      commandePublique.titulaires = commandePublique.titulaires.filter((titulaire) => {
        const latitude = titulaire.titulaire.etablissement?.latitude;
        const longitude = titulaire.titulaire.etablissement?.longitude;
        if (latitude && longitude) {
          return (
            limitesGPS.latitudeMinimum < latitude &&
            limitesGPS.longitudeMinimum < longitude &&
            limitesGPS.latitudeMaximum > latitude &&
            limitesGPS.longitudeMaximum > longitude
          );
        }
        return false;
      });
      return (
        commandePublique.titulaires.length > 0 &&
        (procedure === SelecteurDivision.PROCEDURES[0] ||
          commandePublique.procedure === procedure) &&
        commandePublique.dateNotification >= periode.debut &&
        commandePublique.dateNotification <= periode.fin
      );
    });
    commandesPubliques.forEach((commandePublique) => {
      commandePublique.titulaires.forEach((titulaire) => {
        const etablissement = titulaire.titulaire.etablissement;
        if (etablissement) {
          etablissement.effectif = Referentiel.effectifParCode[etablissement.codeEffectif];
        }
      });
    });
    return commandesPubliques;
  }

  private transformerEnTitulaires(commandesPubliques: Array<CommandePublique>): Array<Titulaire> {
    const titulaireParSiret = new Map<number, Titulaire>();
    commandesPubliques.forEach((commandePublique) => {
      commandePublique.titulaires.forEach((titulaire) => {
        if (!titulaireParSiret.has(titulaire.titulaire.id)) {
          titulaire.titulaire.commandesPubliques = [];
          titulaireParSiret.set(titulaire.titulaire.id, titulaire.titulaire);
        }
        titulaireParSiret.get(titulaire.titulaire.id)!.commandesPubliques?.push(commandePublique);
      });
    });
    return [...titulaireParSiret.values()];
  }
}
