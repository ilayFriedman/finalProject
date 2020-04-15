import { TestBed } from '@angular/core/testing';

import { NodeMenuHendlerService } from './node-menu-hendler.service';

describe('ReferenceHendlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NodeMenuHendlerService = TestBed.get(NodeMenuHendlerService);
    expect(service).toBeTruthy();
  });
});
