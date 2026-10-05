import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelecteurDivision } from './selecteur-division';
import { provideTranslateService } from '@ngx-translate/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('SelecteurDivision', () => {
  let component: SelecteurDivision;
  let fixture: ComponentFixture<SelecteurDivision>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelecteurDivision],
      providers: [provideTranslateService(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(SelecteurDivision);
    httpMock = TestBed.inject(HttpTestingController);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  describe('GIVEN data referential', () => {
    beforeEach(async () => {
      const testRequest = httpMock.expectOne(
        'http://localhost:4200/informatique/angular/decp/json/divisionsCPV.json',
      );
      expect(testRequest.request.method).toBe('GET');
      testRequest.flush({
        '03': "Produits agricoles, de l'élevage, de la pêche, de la sylviculture et produits connexes",
      });
    });

    it('WHEN #divisions observer is called THEN the component is defined', () => {
      expect(component).toBeDefined();
    });
  });
});
