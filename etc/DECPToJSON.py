import csv
import re
from io import TextIOWrapper

from pyproj import Transformer

import json


class DECPToJSON:
    """Conversion des fichiers json listant les commandes publiques vers une structure JSON"""

    lambert93_to_wgs84 = Transformer.from_crs("EPSG:2154", "EPSG:4326", always_xy=True)

    def dispatch(self, fichiers):
        divisions = self._getDivisions()
        communeByCodePostal, communeByCodeInsee = self._convertCommunesToDicts()
        uniteBySiren = self._convertUnitesToDict()
        etablissementBySiret = self._convertEtablissementsToDict(uniteBySiren)
        fichierByDivision = self._openFichierByDivision(divisions)
        divisionsModifiees: set[str] = set[str]()
        rapport = Rapport()
        for fichier in fichiers:
            with open(f'./data/{fichier}', 'r', encoding="utf-8") as marchesJSONFile:
                data = json.load(marchesJSONFile)
                for marche in data['marches']['marche']:
                    if (marche['codeCPV']):
                        commune = self._getCommune(communeByCodePostal, communeByCodeInsee, marche['lieuExecution'],
                                                   rapport)
                        division = marche['codeCPV'][0:2]
                        if (commune and division in divisions):
                            marche['lieuExecution']['commune'] = commune.nom
                            marche['lieuExecution']['latitude'] = commune.latitude
                            marche['lieuExecution']['longitude'] = commune.longitude
                            for titulaire in marche['titulaires']:
                                if (titulaire['titulaire']['typeIdentifiant'] == 'SIRET'):
                                    etablissement = etablissementBySiret.get(titulaire['titulaire']['id'])
                                    if (etablissement):
                                        titulaire['titulaire']['etablissement'] = etablissement
                                    else:
                                        rapport.etablissementsIntrouvables += 1
                                else:
                                    rapport.titulairesSansSiret += 1
                            fichier = fichierByDivision.get(division)
                            divisionsModifiees.add(division)
                            fichier.write(f'{json.dumps(marche, ensure_ascii=False)},\n')
                            rapport.commandesConverties += 1
                        else:
                            if (division not in divisions):
                                rapport.divisionsInconnues += 1
                    else:
                        rapport.cpvManquants += 1
        self._printRapport(rapport)
        self._closeFichierByDivision(fichierByDivision, divisionsModifiees)

    def _getCommune(self, communeByCodePostal: dict[str, Commune], communeByCodeInsee: dict[str, Commune],
                    lieuExecution, rapport: Rapport) -> Commune | None:
        typeCode = lieuExecution['typeCode']
        code = lieuExecution['code']
        match typeCode:
            case 'Code postal':
                commune = communeByCodePostal.get(code)
                if (not commune):
                    rapport.codesPostauxIntrouvables += 1
                return commune
            case 'Code commune':
                commune = communeByCodeInsee.get(code)
                if (not commune):
                    rapport.codesCommunesIntrouvables += 1
                return commune
            case 'Code pays':
                rapport.typesCodePays += 1
                return None
            case 'Code département':
                rapport.typesCodeDepartement += 1
                return None
            case _:
                rapport.typesCodesLieuxNonSupportes += 1
                return None

    def _convertCommunesToDicts(self) -> tuple[dict[str, Commune], dict[str, Commune]]:
        communeByCodePostal = dict[str, Commune]([])
        communeByCodeInsee = dict[str, Commune]([])
        with open('./data/communes-france-2026.csv', 'r', encoding="utf-8") as csvFile:
            csvReader = csv.reader(csvFile, delimiter=',', quotechar='"')
            next(csvReader)
            for row in csvReader:
                nom = row[1]
                codeInsee = row[0]
                codePostal = row[17]
                codesPostaux: list[str] = row[18].split(',')
                latitude = row[52]
                longitude = row[53]
                if (nom and codeInsee and codePostal and len(codesPostaux) > 0 and latitude and longitude):
                    commune = Commune(nom, codeInsee, codePostal, latitude, longitude)
                    communeByCodeInsee[codeInsee] = commune
                    for codePostal in codesPostaux:
                        commune = Commune(nom, codeInsee, codePostal.strip(), latitude, longitude)
                        communeByCodePostal[codePostal.strip()] = commune
        return communeByCodePostal, communeByCodeInsee

    def _convertEtablissementsToDict(self, uniteBySiren: dict[str, str]) -> dict[str, dict]:
        etablissementBySiret = dict[str, dict]([])
        inputFile = './data/StockEtablissement_utf8.csv'
        with (open(inputFile, 'r', encoding="utf-8") as csvFile):
            csvReader = csv.reader(csvFile, delimiter=',', quotechar='"')
            for row in csvReader:
                diffusion = row[3] == 'O'
                actif = row[45] == 'A'
                etablissement = row[46]
                siret = row[2]
                if (not etablissement or etablissement == '[ND]'):
                    etablissement = row[49]
                if (not etablissement or etablissement == '[ND]'):
                    etablissement = uniteBySiren[siret[0:9]]
                naf = row[50]
                nafRev2 = row[51] == 'NAFRev2'
                coordonneeLambertAbscisse = row[28]
                coordonneeLambertOrdonnee = row[29]
                if (len(naf) > 3 and diffusion and actif and etablissement and etablissement != '[ND]' and nafRev2):
                    codeEffectif = row[5]
                    dateCreation = row[4]
                    etablissementSiege = row[9]
                    typeVoie = row[16]
                    voie = row[17]
                    codePostal = row[18]
                    commune = row[19]
                    json = {
                        'etablissement': re.sub(r'["\t\\]', ' ', etablissement.strip()),
                        'naf': naf.strip(),
                        'siret': siret.strip(),
                        'codeEffectif': codeEffectif.strip(),
                        'dateCreation': dateCreation.strip(),
                        'etablissementSiege': etablissementSiege,
                        'typeVoie': typeVoie.strip(),
                        'voie': voie.strip(),
                        'codePostal': codePostal.strip(),
                        'commune': commune.strip()
                    }
                    etablissementBySiret[siret] = json
                    if (coordonneeLambertAbscisse and coordonneeLambertOrdonnee):
                        longitude, latitude = self.lambert93_to_wgs84.transform(coordonneeLambertAbscisse,
                                                                                coordonneeLambertOrdonnee)
                        json['longitude'] = longitude
                        json['latitude'] = latitude
        return etablissementBySiret

    def _getDivisions(self) -> list[str]:
        divisions = list[str]()
        with open('./json/divisionsCPV.json', 'r', encoding="utf-8") as divisionsJSONFile:
            data = json.load(divisionsJSONFile)
            for division in data:
                divisions.append(division)
        return divisions

    def _openFichierByDivision(self, divisions) -> dict[str, TextIOWrapper]:
        fichierByDivision = dict[str, TextIOWrapper]()
        for division in divisions:
            nomFichier = f'./json/decp/{division}.json'
            # if os.path.isfile(nomFichier):
            #     fichier = open(nomFichier, 'a+', encoding="utf-8")
            #     fichierByDivision[division] = fichier
            #     fichier.seek(0, 2)
            #     taille = fichier.tell()
            #     if taille > 0:
            #         fichier.seek(taille - 3)
            #         fichier.truncate()
            #     if (taille > 2):
            #         fichier.write(',\n')
            fichier = open(nomFichier, 'w', encoding="utf-8")
            fichierByDivision[division] = fichier
            fichier.write('[\n')
        return fichierByDivision

    def _closeFichierByDivision(self, fichierByDivision: dict[str, TextIOWrapper], divisionsModifiees: set[str]):
        for division, fichier in fichierByDivision.items():
            if (division in divisionsModifiees):
                fichier.seek(0, 2)
                taille = fichier.tell()
                if taille > 0:
                    fichier.seek(taille - 3)
                    fichier.truncate()
                    fichier.write('\n')
            fichier.write(']')
            fichier.close()

    def _printRapport(self, rapport):
        print(f'Commandes converties avec succès : {rapport.commandesConverties}')
        print(f'Codes postaux introuvables (requis) : {rapport.codesPostauxIntrouvables}')
        print(f'Codes communes introuvables (requis) : {rapport.codesCommunesIntrouvables}')
        print(f'Types code pays non supportés : {rapport.typesCodePays}')
        print(f'Types code département non supportés : {rapport.typesCodeDepartement}')
        print(f'Types codes de lieux non supportés : {rapport.typesCodesLieuxNonSupportes}')
        print(f'Codes CPV manquants (requis) : {rapport.cpvManquants}')
        print(f'Divisions inconnues (requis) : {rapport.divisionsInconnues}')
        print(f'Titulaires sans SIRET (optionnel) : {rapport.titulairesSansSiret}')
        print(f'Etablissements introuvables (optionnel) : {rapport.etablissementsIntrouvables}')

    def _convertUnitesToDict(self) -> dict[str, str]:
        uniteBySiren = dict[str, str]([])
        inputFile = './data/StockUniteLegale_utf8.csv'
        with open(inputFile, 'r', encoding="utf-8") as csvFile:
            csvReader = csv.reader(csvFile, delimiter=',', quotechar='"')
            for row in csvReader:
                siren = row[0]
                nom = row[21]  # nomUniteLegale
                denomination = row[23]  # denominationUniteLegale
                if (denomination):
                    uniteBySiren[siren] = denomination
                else:
                    uniteBySiren[siren] = nom
        return uniteBySiren


class Commune:
    def __init__(self, nom, codeInsee, codePostal, latitude, longitude):
        self.nom = nom
        self.codeInsee = codeInsee
        self.codePostal = codePostal
        self.latitude = latitude
        self.longitude = longitude


class Rapport:
    def __init__(self):
        self.commandesConverties = 0
        self.codesPostauxIntrouvables = 0
        self.codesCommunesIntrouvables = 0
        self.typesCodePays = 0
        self.typesCodeDepartement = 0
        self.typesCodesLieuxNonSupportes = 0
        self.cpvManquants = 0
        self.divisionsInconnues = 0
        self.titulairesSansSiret = 0
        self.etablissementsIntrouvables = 0


DECPToJSON().dispatch(
    ['decp-2025-10.json', 'decp-2025-11.json', 'decp-2025-12.json', 'decp-2026-01.json', 'decp-2026-02.json',
     'decp-2026-03.json', 'decp-2026-04.json', 'decp-2026-05.json', 'decp-2026-06.json', 'decp-2026-07.json',
     'decp-2026-08.json', 'decp-2026-09.json'])
