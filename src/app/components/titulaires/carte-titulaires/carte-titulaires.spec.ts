import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarteTitulaires } from './carte-titulaires';
import { provideTranslateService } from '@ngx-translate/core';

describe('CarteTitulaires', () => {
  let component: CarteTitulaires;
  let fixture: ComponentFixture<CarteTitulaires>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarteTitulaires],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(CarteTitulaires);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
