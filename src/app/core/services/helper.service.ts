import { Injectable } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  isLoading = false;
  private loading: HTMLIonLoadingElement;
  private toast: HTMLIonToastElement;

  constructor(
    private iab: InAppBrowser,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) { }

  dismissLoading(): void {
    this.loading.dismiss();
  }

  dismissToast(): void {
    this.toast.dismiss();
  }

  openURL(url?: string) {
    if (!url) {
      url = 'https://www.liveallintoday.com/';
    }
    const browser = this.iab.create(url, '_blank');
    browser.show();
    browser.on('loaderror').subscribe(res => {
      console.log('error inapp browser');
      console.log('Error message ' + res.message);
    });
  }

  async presentLoading(text?: string) {
    this.loading = await this.loadingCtrl.create({
      message: text ? text : '',
    });
    await this.loading.present();

    // const { role, data } = await this.loading.onDidDismiss();
  }

  async presentToast(msg?: string) {
    if (!msg) {
      msg = 'Your settings have been saved.';
    }
    this.toast = await this.toastCtrl.create({
      message: msg,
      showCloseButton: true,
      position: 'middle'
    });
    this.toast.present();
  }
}
