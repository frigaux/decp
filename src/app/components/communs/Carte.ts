import * as L from 'leaflet';
import { Commune } from '../../services/commune.interface';
import { LayerGroup } from 'leaflet';
import { ElementRef } from '@angular/core';
import { LimitesGPS } from '../../services/limites-gps.interface';

export function initialiserCarte(
  groupeMarqueurs: LayerGroup<any>,
  conteneurCarte: ElementRef,
): L.Map {
  // 1. Définir les frontières géographiques de la France métropolitaine (Sud-Ouest et Nord-Est)
  const france = L.latLngBounds(
    L.latLng(41.3, -5.5), // Coin Sud-Ouest (proche de la frontière espagnole / océan)
    L.latLng(51.1, 10.0), // Coin Nord-Est (proche des frontières allemandes / belges)
  );

  // 2. Initialiser la carte avec les restrictions
  const carte = L.map(conteneurCarte.nativeElement, {
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
  }).addTo(carte);

  groupeMarqueurs.addTo(carte);

  return carte;
}

export function positionnerCarte(carte: L.Map, commune: Commune, rayon: number): LimitesGPS {
  carte.setZoom(rayon < 11 ? 12 : rayon < 26 ? 11 : 10);
  carte.setView([commune.latitude, commune.longitude]);

  const deltaLatitude = _calculerDeltaLatitude(rayon);
  const deltaLongitude = _calculerDeltaLongitude(rayon, commune);

  const deltaLatitudeCarte = _calculerDeltaLatitude(rayon * 1.1);
  const deltaLongitudeCarte = _calculerDeltaLongitude(rayon * 1.1, commune);

  carte.setMaxBounds([
    [commune.latitude - deltaLatitudeCarte, commune.longitude - deltaLongitudeCarte],
    [commune.latitude + deltaLatitudeCarte, commune.longitude + deltaLongitudeCarte],
  ]);

  return {
    latitudeMinimum: commune.latitude - deltaLatitude,
    longitudeMinimum: commune.longitude - deltaLongitude,
    latitudeMaximum: commune.latitude + deltaLatitude,
    longitudeMaximum: commune.longitude + deltaLongitude,
  };
}

function _calculerDeltaLongitude(rayon: number, commune: Commune): number {
  const latitudeRadians = commune.latitude * (Math.PI / 180);
  return rayon / (111.32 * Math.cos(latitudeRadians));
}

function _calculerDeltaLatitude(rayon: number): number {
  return (180 / Math.PI) * (rayon / 6371);
}
