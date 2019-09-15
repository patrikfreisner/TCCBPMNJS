import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GenericDataServiceService {

  httpOptions = {
    headers: new HttpHeaders({
      'content-type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
    })
  };

  apiBasicUrl = 'api/?';

  constructor(
    private http: HttpClient,
  ) {
  }

  public getObjects(url: string): Observable<any[]> {
    return this.http.get<any>(url).pipe(
      map((data: any[]) => {
        const collection: Array<any> = data;
        const objectCollection: any[] = [];

        collection.forEach(item => {
          objectCollection.push(item as any);
        });

        return objectCollection;
      }),
      catchError(this.handleError)
    );
  }

  public getObjectById(url: string, id: number): Observable<any> {
    const URL_STR = `${url}/${id}`;
    console.log(URL_STR);
    return this.http.get<any>(URL_STR).pipe(
      catchError(this.handleError)
    );
  }

  public createObject(url: string, object: any): Observable<any> {
    return this.http.post(url, object, this.httpOptions).pipe(
      tap((c: any) => console.log('createObject')),
      catchError(this.handleError)
    );
  }

  public updateObject(url: string, object: any): Observable<any> {
    return this.http.put(`${url}/${object.id}`, object).pipe(
      tap((c: any) => console.log('updateCustomer')),
      catchError(this.handleError)
    );
  }

  public deleteObject(url: string, id: number): Observable<{}> {
    const url_string = `${url}/${id}`;
    return this.http.delete(url_string).pipe(
      catchError(this.handleError)
    );
  }

  public searchByNotationCode(notationCode: string): Observable<any> {
    return this.http.get('http://192.168.56.102:3000/searchByNotationCode?bpm_notation_code=' + notationCode).pipe(
      catchError(this.handleError)
    );
  }

  private handleError() {
    return throwError('Erro generico ao realizar requisição!');
  }
}
