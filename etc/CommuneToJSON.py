import csv
from io import Reader, TextIOWrapper

class CommuneToJSON:
    """Conversion du fichier csv listant les communes vers une structure JSON"""

    def convert(self):
        with open('./json/communesFrance2026.json', 'w', encoding="utf-8") as jsonFile:
            jsonFile.write('[')
            with open('./data/communes-france-2026.csv', 'r', encoding="utf-8") as csvFile:
                csvReader = csv.reader(csvFile, delimiter=',', quotechar='"')
                next(csvReader)
                self._convertRows(csvReader, jsonFile)
            jsonFile.write('\n]')

    def _convertRows(self, csvReader: Reader, jsonFile: TextIOWrapper):
        firstRow = True
        for row in csvReader:
            nomStandard = row[1]
            codePostal = row[17]
            latitude = row[52]
            longitude = row[53]
            if (nomStandard and codePostal and latitude and longitude):
                if (not firstRow):
                    jsonFile.write(",")
                firstRow = False
                jsonFile.write("\n  {\n"
                               f'    "nom": "{nomStandard.strip()}",\n'
                               f'    "codePostal": "{codePostal.strip()}",\n'
                               f'    "latitude": {latitude},\n'
                               f'    "longitude": {longitude}\n'
                               "  }")

CommuneToJSON().convert()
