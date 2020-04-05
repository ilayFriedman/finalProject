import { TestBed } from '@angular/core/testing';

import { ContextHendlerService } from './context-hendler.service';

describe('ContextHendlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ContextHendlerService = TestBed.get(ContextHendlerService);
    expect(service).toBeTruthy();
  });
});
