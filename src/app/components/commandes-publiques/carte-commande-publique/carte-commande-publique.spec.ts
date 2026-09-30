import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarteCommandePublique } from './carte-commande-publique';
import { provideTranslateService } from '@ngx-translate/core';

describe('CarteCommandePublique', () => {
  let component: CarteCommandePublique;
  let fixture: ComponentFixture<CarteCommandePublique>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarteCommandePublique],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(CarteCommandePublique);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
