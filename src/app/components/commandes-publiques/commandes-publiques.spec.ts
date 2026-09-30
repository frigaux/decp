import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommandesPubliques } from './commandes-publiques';
import { provideTranslateService } from '@ngx-translate/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('CommandesPubliques', () => {
  let component: CommandesPubliques;
  let fixture: ComponentFixture<CommandesPubliques>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandesPubliques],
      providers: [provideTranslateService(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CommandesPubliques);
    httpMock = TestBed.inject(HttpTestingController);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
