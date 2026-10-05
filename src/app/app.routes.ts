import { Routes } from '@angular/router';
import { CommandesPubliques } from './components/commandes-publiques/commandes-publiques';
import { Titulaires } from './components/titulaires/titulaires';

export const routes: Routes = [
  { path: '', component: CommandesPubliques },
  { path: 'titulaires', component: Titulaires },
];
