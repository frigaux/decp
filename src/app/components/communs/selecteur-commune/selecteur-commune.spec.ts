import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelecteurCommune } from './selecteur-commune';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';

describe('SelecteurCommune', () => {
  let component: SelecteurCommune;
  let fixture: ComponentFixture<SelecteurCommune>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelecteurCommune],
      providers: [provideTranslateService(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(SelecteurCommune);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  describe('GIVEN data referential', () => {
    beforeEach(async () => {
      const testRequest = httpMock.expectOne(
        'http://localhost:4200/informatique/angular/decp/json/communesFrance2026.json',
      );
      expect(testRequest.request.method).toBe('GET');
      testRequest.flush([
        {
          nom: "L'Abergement-Clémenciat",
          codePostal: '01400',
          latitude: 46.153,
          longitude: 4.926,
        },
      ]);
    });

    it('WHEN #communes observer is called THEN the component is defined', () => {
      expect(component).toBeDefined();
      expect(component.communes()).toHaveLength(1);
    });
  });
});
