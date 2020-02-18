import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextMapConverterComponent } from './text-map-converter.component';

describe('TextMapConverterComponent', () => {
  let component: TextMapConverterComponent;
  let fixture: ComponentFixture<TextMapConverterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextMapConverterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextMapConverterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
