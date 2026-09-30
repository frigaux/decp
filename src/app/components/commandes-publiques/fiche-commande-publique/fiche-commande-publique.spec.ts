import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FicheCommandePublique } from './fiche-commande-publique';

describe('FicheCommandePublique', () => {
  let component: FicheCommandePublique;
  let fixture: ComponentFixture<FicheCommandePublique>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FicheCommandePublique],
    }).compileComponents();

    fixture = TestBed.createComponent(FicheCommandePublique);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
