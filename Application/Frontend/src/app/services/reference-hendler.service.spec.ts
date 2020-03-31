import { TestBed } from '@angular/core/testing';

import { ReferenceHendlerService } from './reference-hendler.service';

describe('ReferenceHendlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ReferenceHendlerService = TestBed.get(ReferenceHendlerService);
    expect(service).toBeTruthy();
  });
});
