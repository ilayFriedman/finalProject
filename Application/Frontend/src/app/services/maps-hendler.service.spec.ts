import { TestBed } from '@angular/core/testing';

import { MapsHandlerService } from './maps-handler.service';

describe('MapsHandlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MapsHandlerService = TestBed.get(MapsHandlerService);
    expect(service).toBeTruthy();
  });
});
