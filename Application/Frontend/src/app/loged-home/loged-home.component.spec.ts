import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogedHomeComponent } from './loged-home.component';

describe('LogedHomeComponent', () => {
  let component: LogedHomeComponent;
  let fixture: ComponentFixture<LogedHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LogedHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogedHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
