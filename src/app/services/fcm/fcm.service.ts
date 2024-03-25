import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { FCM } from '@capacitor-community/fcm';
import {
  ActionPerformed,
  PushNotifications,
} from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { Howl } from 'howler';
import { ToastController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { HelpersService } from '../helpers/helpers.service';
import { Events } from 'src/app/enums/events';
@Injectable({
  providedIn: 'root',
})
export class FcmService {
  user: any = {};
  constructor(
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private storage: Storage,
    private router: Router,
    private helpers: HelpersService,
    private http: HttpClient // private authService: AuthService
  ) {}

  async initPush() {
    this.user = await this.storage.get('balsanUserData');
    if (
      Capacitor.getPlatform() == 'web' ||
      Capacitor.getPlatform() == 'electron'
    )
      return;
    await PushNotifications.requestPermissions();
    await PushNotifications.register();
    this.notificationsAll();
    // this.notificationsOne()
  }

  async notificationsAll() {
    await FCM.subscribeTo({ topic: `all` });
    // if (this.user.phone) await FCM.subscribeTo({ topic: `user-${this.user.phone}` })

    PushNotifications.addListener(
      'pushNotificationReceived',
      async (notification: any) => {
        this.presentToast(notification.title, notification.body);

        if (notification.data.route == 'news') {
          if (this.user.type == 1) {
            this.navCtrl.navigateForward('/tabs1/news');
          } else if (this.user.type == 2) {
            this.navCtrl.navigateForward('/tabs2/news');
          }

          this.navCtrl.navigateForward('/news');
        } else if (notification.data.route == 'orders') {
          if (this.user.type == 1) {
            this.navCtrl.navigateForward('/tabs1/home');
          } else if (this.user.type == 2) {
            this.navCtrl.navigateForward('/tabs2/orders');
          }
        } else if (
          notification.data.route == 'clients' &&
          this.user.type == 2
        ) {
          this.navCtrl.navigateForward('/tabs2/clients');
        } else if (notification.data.route == 'notification') {
          this.navCtrl.navigateForward('/notification');
        }
        //  else if (noti.notification.data == 'member') {
        //   this.navCtrl.navigateForward('/tabs/members');
        // }
        else if (notification.data.route == 'userdeleted') {
          // this.authService.logOut();
          await this.unsubscribeOne();
          await this.unsubscribeAll();
          await this.storage.clear();
          this.navCtrl.navigateRoot('/login');
        }
      }
    );
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      async (noti) => {
        console.log(noti.notification.data);

        // if (noti.notification.data.route == 'news') {
        //   this.navCtrl.navigateForward('/news');
        // } else if (noti.notification.data.route == 'orders') {
        //   this.navCtrl.navigateForward('/tabs2/orders');
        // } else if (noti.notification.data.route == 'clients') {
        //   this.navCtrl.navigateForward('/tabs2/clients');
        // } else if (noti.notification.data.route == 'notification') {
        //   this.navCtrl.navigateForward('/notification');
        // }
        // //  else if (noti.notification.data == 'member') {
        // //   this.navCtrl.navigateForward('/tabs/members');
        // // }
        // else if (noti.notification.data.route == 'userdeleted') {
        //   // this.authService.logOut();
        //   await this.storage.clear();
        //   this.navCtrl.navigateRoot('/login');
        // }
      }
    );
  }
  async addLiesner() {
    PushNotifications.addListener(
      'pushNotificationReceived',
      async (notification) => {
        this.presentToast(notification.title, notification.body);
      }
    );
  }
  async notificationsOne() {
    if (
      Capacitor.getPlatform() == 'web' ||
      Capacitor.getPlatform() == 'electron'
    )
      return;
    if (this.user.phone) {
      await FCM.subscribeTo({ topic: `user-${this.user.phone}` });

      // PushNotifications.addListener(
      //   'pushNotificationReceived',
      //   async (notification) => {
      //     this.presentToast(notification.title, notification.body);
      //   }
      // );
    }
  }

  async notificationsAdmin() {
    if (
      Capacitor.getPlatform() == 'web' ||
      Capacitor.getPlatform() == 'electron'
    )
      return;
    await FCM.subscribeTo({ topic: `user-admin` });
  }
  async unsubscribeAdmin() {
    if (
      Capacitor.getPlatform() == 'web' ||
      Capacitor.getPlatform() == 'electron'
    )
      return;
    await FCM.unsubscribeFrom({ topic: `user-admin` }).catch((err) => {
      console.log(err);
    });
  }
  // async getToken() {
  //   if (Capacitor.getPlatform() == 'web') return null
  //   const token = await FCM.getToken()
  //   return token.token
  // }

  async unsubscribeAll() {
    if (
      Capacitor.getPlatform() == 'web' ||
      Capacitor.getPlatform() == 'electron'
    )
      return;
    await FCM.unsubscribeFrom({ topic: `all` });
  }
  async unsubscribeOne() {
    if (
      Capacitor.getPlatform() == 'web' ||
      Capacitor.getPlatform() == 'electron'
    )
      return;
    if (this.user?.phone)
      await FCM.unsubscribeFrom({ topic: `user-${this.user.phone}` }).catch(
        (err) => {
          console.log(err);
        }
      );
  }
  // Toast For Notification
  async presentToast(header: string, message: string) {
    const toast = await this.toastCtrl.create({
      header,
      message,
      position: 'top',
      duration: 3000,
    });
    this.notificationSound();
    await toast.present();
    toast.addEventListener('click', async () => {
      // this.helpers.emitEvent(Events.refreshOrders);
      // this.navCtrl.navigateForward('/notification');
      await toast.dismiss();
    });
  }
  notificationSound() {
    const sound = new Howl({
      src: ['../../../assets/short-noti.mp3'],
      volume: 1,
    });

    sound.play();
  }
  // NotificationSound
  sound() {
    const sound = new Howl({
      src: ['../../../assets/New Order.mp3'],
      volume: 1,
    });

    sound.play();
  }

  // postNotification(body: any) {
  //   this.http.post(`http://209.250.237.58:5006/fcm`, body).pipe(take(1)).subscribe()
  // }
}
