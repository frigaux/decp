import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelecteurMois } from './selecteur-mois';
import { provideTranslateService } from '@ngx-translate/core';

describe('SelecteurMois', () => {
  let component: SelecteurMois;
  let fixture: ComponentFixture<SelecteurMois>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelecteurMois],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(SelecteurMois);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
