import { TestBed } from '@angular/core/testing';

import { MlkitScannerService } from './mlkit-scanner.service';

describe('MlkitScannerService', () => {
  let service: MlkitScannerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MlkitScannerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
