import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {listLoadedError, listLoadedSuccess, loadList} from './actions';

import {GitHubService} from '../../github.service';
import {of} from 'rxjs';
import {catchError, map, switchMap, tap} from 'rxjs/operators';
import {Action} from "@ngrx/store";

@Injectable({
    providedIn: 'root'
})
export class GlobalEffects {

    loadList$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loadList.type),
            switchMap(action =>
                this.gitHubService.getData(action).pipe(
                    tap(v => console.log('Action triggered effect:', action)),
                    map(list => listLoadedSuccess({list})),
                    tap(v => console.log(v.type, ' created:', v)),
                    catchError(error => of(listLoadedError({error})))
                )
            )
        )
    );

    constructor(private actions$: Actions, private gitHubService: GitHubService) {

    }

}
