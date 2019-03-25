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
    public auth: AngularFireAuth,
    private db: AngularFirestore
  ) {
    this.usersCollection = this.db.collection<User>('users');
  }

  createUser(user: User, password: string): Promise<any> {
    return this.auth.auth.createUserWithEmailAndPassword(user.email, password);
  }

  deleteUser(): Promise<any> {
    if (this.auth.auth.currentUser && this.auth.auth.currentUser.isAnonymous) {
      return this.auth.auth.currentUser.delete();
    }
  }

  getAllUsers(): Observable<User[]> {
    return this.usersCollection.valueChanges();
  }

  getUser(firebaseUser: firebase.User): Observable<any> {
    console.log(firebaseUser.email);
    const userRef = this.db.collection('users').doc(firebaseUser.email);
    return userRef.get();
  }

  getUserByEmail(email: string): Observable<any> {
    const userRef = this.db.collection('users').doc(email);
    return userRef.get();
  }

  isAnonymous(): boolean {
    console.log('isAnonymous', this.auth.auth.currentUser.isAnonymous);
    if (this.auth.auth.currentUser.isAnonymous) {
      return true;
    } else {
      return false;
    }
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
    return this.auth.auth.signInWithEmailAndPassword(email, password);
  }

  loginAnonymously(): Promise<any> {
    return this.auth.auth.signInAnonymously();
  }

  logout(): void {
    this.auth.auth.signOut();
  }

  resetPassword(email: string): void {
    this.auth.auth.sendPasswordResetEmail(email);
  }

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
      if (dbUser.devices) {
        this.user.devices = dbUser.devices;
      }
    }
  }

  updateUser(user: User): Promise<any> {
    return this.usersCollection.doc(user.email).set({
      ...user
    }, { merge: true });
  }
}
