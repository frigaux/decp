export interface Titulaire {
  id: number;
  typeIdentifiant: string;
  etablissement?: {
    etablissement: string;
    naf: string;
    siret: string;
    codeEffectif: string;
    dateCreation: string; // ISO-8601
    etablissementSiege: string; // booléen
    typeVoie: string;
    voie: string;
    codePostal: string;
    commune: string;
    longitude: number;
    latitude: number;
    effectif?: string;
  };
}
