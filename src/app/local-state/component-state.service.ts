import { Injectable, OnDestroy, Optional } from '@angular/core';
import { Router } from '@angular/router';
import {interval, ConnectableObservable, merge, Observable, Subject} from 'rxjs';
import {endWith, map, mergeAll, publishReplay, scan, takeUntil, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ComponentStateService implements OnDestroy {

  onDestroy$ = new Subject();

  private effectObservable$$ = new Subject();
  private effect$ = this.effectObservable$$
    .pipe(
      mergeAll(),
      takeUntil(this.onDestroy$),
      publishReplay(1)
    );

  private commandObservable$$ = new Subject();
  state$: Observable<any> =
    this.commandObservable$$
      .pipe(
        mergeAll(),
        scan((s, c) => {
          const [keyToDelete, value]: [string, any] = Object.entries(c)[0];
          const isKeyToDeletePresent = keyToDelete in s;
          // The key you want to delete is not stored :)
          if (!isKeyToDeletePresent && value === undefined) {
            return s;
          }
          // Delete slice
          if (value === undefined) {
            const {[keyToDelete]: v, ...newS} = s as any;
            return newS;
          }
          // update state
          return ({...s, ...c});
        }, {}),
        takeUntil(this.onDestroy$),
        publishReplay(1)
      );

  constructor() {
    // the local state service's `state$` observable should be hot on instantiation
    const subscription = (this.state$ as ConnectableObservable<any>).connect();
    subscription.add((this.effect$ as ConnectableObservable<any>).connect());

    this.onDestroy$.subscribe(_ => subscription.unsubscribe());
  }

  connectSlices(config: { [key: string]: Observable<any> }): void {
    // @TODO validation / typing params
    // @TODO consider multiple observables for the same key. Here I would suggest last one wins => switchAll
    Object.entries(config)
      .map(([slice, state$]) => state$.pipe(
        map(state => ({[slice]: state})),
        endWith({[slice]: undefined})
      )
    )
      .forEach(slice$ =>  this.commandObservable$$.next(slice$));
  }

  // @TODO implement key values to override effects
  connectEffects(effects: Observable<any>[]): void {
    console.log('connectEffects', effects);
    // @TODO validation / typing params
    effects
      .forEach(effect$ =>  {
        this.effectObservable$$.next(effect$)
      });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(true);
  }

}