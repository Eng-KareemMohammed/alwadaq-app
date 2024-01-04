// import { FcmService } from './../fcm/fcm.service';
import { HelpersService } from './../helpers/helpers.service';
import { Injectable } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { from } from 'rxjs';
import { DataService } from '../data/data.service';
// import { Device } from '@capacitor/device';
import { FcmService } from '../fcm/fcm.service';

const USER = 'alwadaq_userData';
const ACCESS_TOKEN = 'accessTokenalwadaq';
const REFRESH_TOKEN = 'refreshTokenalwadaq';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public userData: any;
  constructor(
    private dataService: DataService,
    private storage: Storage,
    private helper: HelpersService,
    private fcm: FcmService,
    private platform: Platform,
    private navCtrl: NavController
  ) {}

  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN);
  }

  removeCredentials() {
    localStorage.removeItem(ACCESS_TOKEN);
    // this.storage.remove('taboor_url');
    this.userData = null;
    return Promise.all([
      this.storage.remove(USER),
      this.storage.remove(REFRESH_TOKEN),
    ]);
  }

  getRefreshToken() {
    let promise = new Promise(async (resolve, reject) => {
      let token = await this.storage.get(REFRESH_TOKEN);
      this.dataService.getData(`/user/refreshToken?token=${token}`).subscribe(
        (res: any) => {
          localStorage.setItem(ACCESS_TOKEN, res.accessToken);
          resolve(res.token);
        },
        (e) => reject(e)
      );
    });
    return from(promise);
  }

  async login(body: any) {
    await this.helper.showLoading();
    const rememberMe = body.rememberMe;
    delete body.rememberMe;
    this.dataService.postData('/user/login', body).subscribe(
      async (user: any) => {
        this.userData = await this.storage.set(USER, user);
        // if (rememberMe)
        this.fcm.user = user;
        await this.storage.set(REFRESH_TOKEN, user.refreshToken);
        localStorage.setItem(ACCESS_TOKEN, user.accessToken);
        this.helper.dismissLoading();

        // else this.fcm.notificationsOne();
        // if (user.status == 'pending') {
        //   this.navCtrl.navigateRoot('/pending');
        // } else {
        // this.navCtrl.navigateRoot('/tabs');
        // }
        if (user.status == 2) {
          this.userData = await this.storage.set(USER, user);
          // this.navCtrl.navigateRoot('/tabs/home');
          if (user.type == 1) {
            await this.navCtrl.navigateRoot('/tabs');
          } else if (user.type == 2) {
            await this.fcm.notificationsOne();
            await this.navCtrl.navigateRoot('/tabs2');
          }
          return;
        } else if (user.status == 1) {
          this.navCtrl.navigateRoot('/pending');
        }
      },
      (err) => {
        this.helper.dismissLoading();
        if (err.status == 404)
          return this.helper.presentToast('خطأ برقم الهاتف او كلمة المرور');
        if (err.status == 410)
          return this.helper.presentToast('غير مسموح لهذا الحساب بالدخول');
        if (err.status == 401) {
          return this.helper.presentToast('خطأ بنوع الحساب');
        } else return this.helper.presentToast('خطأ بالشبكة');
      }
    );
  }
  async register(body: any) {
    await this.helper.showLoading();
    this.dataService.postData('/user/register', body).subscribe(
      async (user: any) => {
        this.userData = await this.storage.set(USER, user);
        await this.storage.set(REFRESH_TOKEN, user.refreshToken);
        localStorage.setItem(ACCESS_TOKEN, user.accessToken);
        this.fcm.user = user;
        this.helper.presentToast('تمت العملية بنجاح');
        this.helper.dismissLoading();
        this.fcm.notificationsOne();
        this.navCtrl.navigateForward('/pending');
      },
      (err) => {
        this.helper.dismissLoading();
        if (err.status == 404)
          return this.helper.presentToast('خطأ برقم الهاتف او كلمة المرور');
        if (err.status == 409)
          return this.helper.presentToast('رقم الهاتف موجود بالفعل ');

        return this.helper.presentToast('خطأ بالشبكة');
      }
    );
  }
  async updateUser(body: any) {
    // await this.helper.showLoading('جاري التحديث');
    this.dataService
      .editData(`/user/update/${this.userData?._id}`, body)
      .subscribe(
        async (user: any) => {
          this.userData = await this.storage.set(USER, user);
          await this.storage.set(REFRESH_TOKEN, user.refreshToken);
          localStorage.setItem(ACCESS_TOKEN, user.accessToken);
          this.helper.presentToast('تم تحديث البيانات بنجاح');
          await this.helper.dismissLoading();
          this.navCtrl.navigateForward('/tabs/home');
        },
        (err) => {
          this.helper.dismissLoading();
          if (err.status == 404)
            return this.helper.presentToast('خطأ برقم الهاتف او كلمة المرور');
          if (err.status == 409)
            return this.helper.presentToast('اسم المستخدم موجود بالفعل ');
          return this.helper.presentToast('خطأ بالشبكة');
        }
      );
  }
  async logOut() {
    await this.helper.showLoading();
    // if (this.userData.type == 'admin' && !this.platform.is('electron'))
    //   await this.fcm.unsubscribeAdmin();
    // if (this.userData.type == 'normal' && !this.platform.is('electron'))
    //   await this.fcm.unsubscribeOne();

    await this.removeCredentials();
    // await this.fcm.unsubscribeAll()
    this.helper.dismissLoading();
    this.navCtrl.navigateRoot('/login');
  }
  userStatus() {
    this.dataService.getData(`/user/status`).subscribe(async (res: any) => {
      console.log(res);

      if (res.status == 2) {
        this.userData = await this.storage.set(USER, res);
        // this.navCtrl.navigateRoot('/tabs/home');
        if (res.type == 1) {
          await this.navCtrl.navigateRoot('/tabs/home');
        } else if (res.type == 2) {
          await this.navCtrl.navigateRoot('/tabs2/orders');
          await this.fcm.addLiesner();
        }
        return;
      } else if (res.status == 1) {
        this.navCtrl.navigateRoot('/pending');
      }
      // this.helper.presentToast(res.message);
      // this.logOut();
    });
  }
  changePassword(body: any) {
    this.helper.showLoading();
    this.dataService.postData(`/user/changePass`, body).subscribe(
      async (user: any) => {
        this.userData = await this.storage.set(USER, user);
        await this.storage.set(REFRESH_TOKEN, user.refreshToken);
        localStorage.setItem(ACCESS_TOKEN, user.accessToken);
        this.helper.dismissLoading();
        // localStorage.removeItem('verified');
        // localStorage.removeItem('vertifiedNumber')
        this.fcm.user = user;

        if (user.type != 'normal') this.fcm.notificationsAdmin();
        else this.fcm.notificationsOne();
        if (user.status == 'pending') {
          this.navCtrl.navigateRoot('/pending');
        } else {
          this.navCtrl.navigateRoot('/tabs/home');
        }
      },
      (err) => {
        this.helper.dismissLoading();
        if (err.status == 404)
          return this.helper.presentToast('خطأ برقم الهاتف او كلمة المرور');
        if (err.status == 409)
          return this.helper.presentToast('اسم المستخدم موجود بالفعل ');
        return this.helper.presentToast('خطأ بالشبكة');
      }
    );
  }
  async updateUserData(active: boolean) {
    let body = { ...this.userData };
    delete body.password;
    body.active = active;
    this.userData = await this.storage.set(USER, body);
  }
}
