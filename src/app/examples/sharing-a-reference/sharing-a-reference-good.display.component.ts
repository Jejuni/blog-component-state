import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {combineLatest, Observable, ReplaySubject} from 'rxjs';
import {map, shareReplay, startWith, switchMap} from 'rxjs/operators';

@Component({
    selector: 'sharing-a-reference-good-display',
    template: `
        <h2>Sharing a reference - Good</h2>
        <form *ngIf="(formGroup$ | async) as formGroup" [formGroup]="formGroup">
            <div *ngFor="let c of formGroup.controls | keyvalue">
                <label>{{c.key}}</label>
                <input [formControlName]="c.key"/>
            </div>
        </form>
    `
})
export class SharingAReferenceGoodDisplayComponent {
    state$ = new ReplaySubject(1);

    formGroup$: Observable<FormGroup> = this.state$
        .pipe(
            startWith({}),
            map(input => this.getFormGroupFromConfig(input)),
            shareReplay(1)
        );

    @Input()
    set formGroupModel(value) {
        this.state$.next(value);
    }

    @Output() formValueChange = this.formGroup$
        .pipe(switchMap((fg: FormGroup) => fg.valueChanges));

    constructor(private fb: FormBuilder) {

    }

    getFormGroupFromConfig(modelFromInput) {
        const config = Object.entries(modelFromInput)
            .reduce((c, [name, initialValue]) => ({...c, [name]: [initialValue]}), {});
        return this.fb.group(config);
    }
}
