import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ContestantsDataProvider } from './contestants-data-provider';
import { Contestant } from './models/contestant';

@Injectable()
export class LocalJsonContestantsProvider extends ContestantsDataProvider {
  private readonly dataPath = '/data/contestants_extract.json';

  constructor(private http: HttpClient) {
    super();
  }

  override getContestants(): Observable<Contestant[]> {
    return this.http
      .get<Contestant[]>(this.dataPath)
      .pipe(map((data) => (Array.isArray(data) ? data : [])));
  }
}
