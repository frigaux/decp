import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Titulaires } from './titulaires';
import { provideTranslateService } from '@ngx-translate/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Titulaires', () => {
  let component: Titulaires;
  let fixture: ComponentFixture<Titulaires>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Titulaires],
      providers: [provideTranslateService(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Titulaires);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
