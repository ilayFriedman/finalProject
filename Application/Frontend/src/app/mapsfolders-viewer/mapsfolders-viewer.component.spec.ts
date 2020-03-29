import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapsfoldersViewerComponent } from './mapsfolders-viewer.component';

describe('MapsfoldersViewerComponent', () => {
  let component: MapsfoldersViewerComponent;
  let fixture: ComponentFixture<MapsfoldersViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapsfoldersViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapsfoldersViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
