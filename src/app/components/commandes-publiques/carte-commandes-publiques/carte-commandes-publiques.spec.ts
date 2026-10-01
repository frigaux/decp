import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarteCommandesPubliques } from './carte-commandes-publiques';
import { provideTranslateService } from '@ngx-translate/core';

describe('CarteCommandesPubliques', () => {
  let component: CarteCommandesPubliques;
  let fixture: ComponentFixture<CarteCommandesPubliques>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarteCommandesPubliques],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(CarteCommandesPubliques);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
