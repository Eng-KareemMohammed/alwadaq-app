import { Injectable } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HelpersService {
  isLoading: boolean = false;
  events = new BehaviorSubject(null);

  constructor(
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  async showLoading(message = '') {
    this.isLoading = true;
    await this.loadingCtrl
      .create({
        message: message,
        mode: 'ios',
      })
      .then((loading) => {
        loading.present().then((_) => {
          if (!this.isLoading) loading.dismiss();
        });
      });
  }

  async dismissLoading() {
    this.isLoading = false;
    await this.loadingCtrl.dismiss().catch((e) => console.log('dismissed'));
  }

  async presentToast(message: string, color = 'dark') {
    let toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'top',
      cssClass: 'ion-text-center',
      color,
      buttons: [
        {
          icon: 'close',
        },
      ],
    });

    await toast.present();
  }

  emitEvent(eventName: string) {
    this.events.next(eventName);
  }

  onChangeEvent() {
    return this.events.asObservable();
  }
}
