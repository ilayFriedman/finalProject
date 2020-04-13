import { TestBed } from '@angular/core/testing';

import { RefCtxHendlerService } from './node-menu-hendler.service';

describe('ReferenceHendlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RefCtxHendlerService = TestBed.get(RefCtxHendlerService);
    expect(service).toBeTruthy();
  });
});
