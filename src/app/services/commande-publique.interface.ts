import { Titulaire } from './titulaire.interface';

export interface CommandePublique {
  id: string;
  acheteur: { id: number };
  nature: string;
  objet: string;
  codeCPV: string;
  procedure: string;
  lieuExecution: {
    code: string;
    typeCode: string;
    commune: string;
    latitude: number;
    longitude: number;
  };
  dureeMois: number;
  dateNotification: string; // ISO-8601
  datePublicationDonnees: string; // ISO-8601
  montant: number;
  formePrix: string;
  attributionAvance: boolean;
  offresRecues: string;
  marcheInnovant: boolean;
  ccag: string;
  sousTraitanceDeclaree: boolean;
  typeGroupementOperateurs: string;
  titulaires: Array<{ titulaire: Titulaire }>;
  considerationsSociales: { considerationSociale: Array<string> };
  considerationsEnvironnementales: { considerationEnvironnementale: Array<string> };
  modalitesExecution: { modaliteExecution: Array<string> };
  techniques: { technique: Array<string> };
  typesPrix: { typePrix: Array<string> };
  source: string;
  tauxAvance: number;
  origineUE: number;
  origineFrance: number;
  idAccordCadre?: string;
}
