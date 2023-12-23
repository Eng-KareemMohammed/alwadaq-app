import { Component } from '@angular/core';
import { AuthService } from './services/auth/auth.service';
import { Storage } from '@ionic/storage-angular';
import { Platform, NavController } from '@ionic/angular';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { register } from 'swiper/element/bundle';
import { MlkitScannerService } from './services/mlkit-scanner/mlkit-scanner.service';
register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private storage: Storage,
    private platform: Platform,
    private navCtrl: NavController,
    private mlkitScannerService: MlkitScannerService,
    private authService: AuthService
  ) {
    this.initApp();
  }
  async initApp() {
    await this.platform.ready();
    if (
      Capacitor.getPlatform() !== 'web' &&
      Capacitor.getPlatform() != 'electron'
    )
      await SplashScreen.show({ autoHide: false });
    await this.storage.create();
    await this.checkUser();
    // await this.fcmService.initPush();

    if (
      Capacitor.getPlatform() !== 'web' &&
      Capacitor.getPlatform() != 'electron'
    )
      await this.setStatusBar();
    if (
      Capacitor.getPlatform() !== 'web' &&
      Capacitor.getPlatform() != 'electron'
    )
      await SplashScreen.hide();

    await this.mlkitScannerService.initScaning();
  }
  async setStatusBar() {
    if (this.platform.is('android'))
      await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
    await StatusBar.setStyle({ style: Style.Light });
  }
  async checkUser() {
    let user = await this.storage.get('alwadaq_userData');
    if (user) {
      // this.authService.userData;
      await this.checkStatus();
      // await this.navCtrl.navigateRoot('/tabs');
      // if (this.authService.userData.type == 1) {
      //   await this.navCtrl.navigateRoot('/tabs');
      // } else if (this.authService.userData.type == 2) {
      //   await this.navCtrl.navigateRoot('/tabs2');
      // }
    } else {
      await this.navCtrl.navigateRoot('/login');
    }
  }
  async checkStatus() {
    this.authService.userStatus();
  }
}
