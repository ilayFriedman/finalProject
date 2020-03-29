import { TestBed } from '@angular/core/testing';

import { FolderHandlerService } from './folder-handler.service';

describe('FolderHandlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FolderHandlerService = TestBed.get(FolderHandlerService);
    expect(service).toBeTruthy();
  });
});
