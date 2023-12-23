import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private data: any = {};
  baseUrl: string = 'http://209.250.237.58:5650';

  constructor(private http: HttpClient) {}

  setParams(body: any) {
    this.data = body;
  }

  get params() {
    return this.data;
  }

  getData(endPoint: string) {
    return this.http.get(this.baseUrl + endPoint).pipe(take(1));
  }

  postData(endPoint: String, body: any) {
    return this.http.post(this.baseUrl + endPoint, body).pipe(take(1));
  }

  editData(endPoint: string, body: any) {
    return this.http.put(this.baseUrl + endPoint, body).pipe(take(1));
  }

  deleteData(endPoint: string) {
    return this.http.delete(this.baseUrl + endPoint).pipe(take(1));
  }
  postOtp(endPoint: string, body: any) {
    return this.http
      .post('http://209.250.237.58:3016/otp' + endPoint, body)
      .pipe(take(1));
  }
}
