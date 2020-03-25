import { Component, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { ModalService } from '../services/modal.service';

@Component({
    selector: 'jw-modal',
    template: `<div class="jw-modal">
    <div class="jw-modal-body">
        <ng-content></ng-content>
    </div>
</div>`
})

export class ModalComponent implements OnInit, OnDestroy {
    @Input() id: string;
    private element: any;

    constructor(private modalService: ModalService, private el: ElementRef) {
        this.element = el.nativeElement;
    }

    ngOnInit(): void {
        let modal = this;
        // console.log("init modal")
        // ensure id attribute exists
        if (!this.id) {
            console.error('modal must have an id');
            return;
        }

        // move element to bottom of page (just before </body>) so it can be displayed above everything else
        document.body.appendChild(this.element);

        // close modal on background click
        this.element.addEventListener('click', function (e: any) {
            if (e.target.className === 'jw-modal') {
                modal.close();
            }        
        });
        this.element.addEventListener('keydown', function(e:any) {
            if (e.key === "Escape") {
                modal.close();
            }
        })

        // add self (this modal instance) to the modal service so it's accessible from controllers
        this.modalService.add(this);
        // this.element.style.display = 'none';
    }

    // remove self from modal service when directive is destroyed
    ngOnDestroy(): void {
        this.modalService.remove(this.id);
        this.element.remove();
    }

    // open modal
    open(): void {
        this.element.style.display = 'block';
        document.body.classList.add('modal-open');
    }

    // close modal
    close(): void {
        this.element.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
}