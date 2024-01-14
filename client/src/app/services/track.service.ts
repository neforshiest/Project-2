import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Tracks } from '../models/tracks';

@Injectable({
  providedIn: 'root'
})
export class TrackService {

  constructor(private http: HttpClient)
  {    
  }

  getTracks(): Observable<Tracks> {
    return this.http.get<Tracks>('http://localhost:3000/api/tracks');
  }
}
