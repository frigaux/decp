import { TestBed } from '@angular/core/testing';
import { Message } from './message';
import { provideTranslateService } from '@ngx-translate/core';

describe('Message', () => {
  let service: Message;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideTranslateService()] });
    service = TestBed.inject(Message);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
