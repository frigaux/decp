import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FicheCommandesPubliques } from './fiche-commandes-publiques';

describe('FicheCommandesPubliques', () => {
  let component: FicheCommandesPubliques;
  let fixture: ComponentFixture<FicheCommandesPubliques>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FicheCommandesPubliques],
    }).compileComponents();

    fixture = TestBed.createComponent(FicheCommandesPubliques);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
