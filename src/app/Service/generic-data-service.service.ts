import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Response} from '@angular/http';
import {Observable, throwError} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GenericDataServiceService {

  httpOptions = {
    headers: new HttpHeaders({
      'content-type': 'application/json', 'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
    })
  };

  apiBasicUrl = 'api/?';

  constructor(
    private http: HttpClient,
  ) {
  }

  public getObject(): Observable<any[]> {
    return this.http.get(this.apiBasicUrl).pipe(
      map((resp: Response) => {
        const collection: Array<any> = resp.json();
        const customerCollection: any[] = [];

        collection.forEach(item => {
          customerCollection.push(item as any);
        });

        return customerCollection;
      }),
      catchError(this.handleError)
    );
  }

  public getObjectById(id: number): Observable<any> {
    const url = `${this.apiBasicUrl}/${id}`;
    return this.http.get(url).pipe(
      map((resp: Response) => {
        const cust = resp.json();

        return cust as any;
      }),
      catchError(this.handleError)
    );
  }

  public createObject(customer: any): Observable<any> {
    return this.http.post(this.apiBasicUrl, customer, this.httpOptions).pipe(
      tap((c: any) => console.log('createCustomer')),
      catchError(this.handleError)
    );
  }

  public updateObject(customer: any): Observable<any> {
    return this.http.put(`${this.apiBasicUrl}/${customer.id}`, customer).pipe(
      tap((c: any) => console.log('updateCustomer')),
      catchError(this.handleError)
    );
  }

  public deleteObject(id: number): Observable<{}> {
    const url = `${this.apiBasicUrl}/${id}`;
    return this.http.delete(url).pipe(
      catchError(this.handleError)
    );
  }

  private handleError() {
    return throwError('Erro generico ao realizar requisição!');
  }
}
