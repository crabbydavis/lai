import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user: User = new User();
  usersCollection: AngularFirestoreCollection<User>;

  constructor(
    private auth: AngularFireAuth,
    private db: AngularFirestore
  ) {
    this.usersCollection = this.db.collection<User>('users');
  }

  createUser(user: User, password: string): Promise<any> {
    return this.auth.auth.createUserWithEmailAndPassword(user.email, password).then(token => {
      console.log('auth token', token);
      this.user = user;
      console.log(this.auth.authState);
    });
  }

  getAllUsers(): Observable<User[]> {
    return this.usersCollection.valueChanges();
  }

  getUser(firebaseUser: firebase.User): Observable<any> {
    const userRef = this.db.collection('users').doc(firebaseUser.email);
    return userRef.get();
  }

  isAuthenticated(): Observable<firebase.User> {
    return this.auth.authState;
  }

  getCancelsFromDB(userEmail: string): Observable<User[]> {
    const userQuery = this.db.collection<User>('cancels', ref => ref.where('email', '==', userEmail)).valueChanges();
    return userQuery;
  }

  getUserFromDB(userEmail: string): Observable<User[]> {
    const userQuery = this.db.collection<User>('users', ref => ref.where('email', '==', userEmail)).valueChanges();
    return userQuery;
  }

  login(email: string, password: string): Promise<any> {
    return this.auth.auth.signInWithEmailAndPassword(email, password).then(token => {
      console.log('token: ' + JSON.stringify(token));
      // const userQuery = this.db.collection<User>('users', ref => ref.where('email', '==', token.user.email)).valueChanges();
      // userQuery
      // .subscribe(docs => {
      //   this.user = docs[0];
      //   console.log('user: ' + JSON.stringify(this.user));
      // });
    });
  }

  logout(): void {
    this.auth.auth.signOut();
  }

  resetPassword(email: string): void {
    this.auth.auth.sendPasswordResetEmail(email);
  }

  /** 
   *     public email: string = '',
    public firstName: string = '',
    public lastName: string = '',
    public planID: string = '',
    public planName: string = '',
    public planType: string = '',
    public signUpDate: string = '',
    public status: string = '',
  */
  setUser(dbUser: User): void {
    if (dbUser) {
      this.user.email = dbUser.email;
      this.user.firstName = dbUser.firstName;
      this.user.lastName = dbUser.lastName;
      this.user.planID = dbUser.planID;
      this.user.planName = dbUser.planName;
      this.user.planType = dbUser.planType;
      this.user.signUpDate = dbUser.signUpDate;
      this.user.status = dbUser.status;
      // this.user.uid = dbUser.uid;
    }
  }
}
