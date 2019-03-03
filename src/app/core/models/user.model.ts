export class User {
    constructor(
      public name: string = '',
      public email: string = '',
      public subscriptionType: number = null,
      public uid: string = ''
    ) {}
  }

  export enum SubscriptionType {
    Annual = 0,
    Monthly = 1,
  }
