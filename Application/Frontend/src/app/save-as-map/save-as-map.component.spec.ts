import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveAsMapComponent } from './save-as-map.component';

describe('SaveAsMapComponent', () => {
  let component: SaveAsMapComponent;
  let fixture: ComponentFixture<SaveAsMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaveAsMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveAsMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
