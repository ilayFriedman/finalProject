import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeMenuModalComponent } from './node-menu-modal.component';

describe('NodeMenuModalComponent', () => {
  let component: NodeMenuModalComponent;
  let fixture: ComponentFixture<NodeMenuModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NodeMenuModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeMenuModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
