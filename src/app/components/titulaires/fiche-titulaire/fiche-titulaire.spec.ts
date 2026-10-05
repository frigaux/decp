import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FicheTitulaire } from './fiche-titulaire';

describe('FicheTitulaire', () => {
  let component: FicheTitulaire;
  let fixture: ComponentFixture<FicheTitulaire>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FicheTitulaire],
    }).compileComponents();

    fixture = TestBed.createComponent(FicheTitulaire);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
