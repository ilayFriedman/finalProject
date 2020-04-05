import { TestBed } from '@angular/core/testing';

import { RefCtxHendlerService } from './reference-context-hendler.service';

describe('ReferenceHendlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RefCtxHendlerService = TestBed.get(RefCtxHendlerService);
    expect(service).toBeTruthy();
  });
});
