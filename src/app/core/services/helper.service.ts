import { Injectable } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  private loading: HTMLIonLoadingElement;
  private toast: HTMLIonToastElement;

  constructor(
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) { }

  dismissLoading(): void {
    this.loading.dismiss();
  }

  dismissToast(): void {
    this.toast.dismiss();
  }

  async presentLoading(text?: string) {
    this.loading = await this.loadingCtrl.create({
      message: text ? text : '',
    });
    await this.loading.present();

    const { role, data } = await this.loading.onDidDismiss();

    console.log('Loading dismissed!');
  }

  async presentToast() {
    this.toast = await this.toastCtrl.create({
      message: 'Your settings have been saved.',
    });
    this.toast.present();
  }
}
