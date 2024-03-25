import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DataService } from 'src/app/services/data/data.service';
import { HelpersService } from 'src/app/services/helpers/helpers.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {
  constructor(
    private navCtrl: NavController,
    public authService: AuthService,
    private dataService: DataService,
    private alertCtrl: AlertController,
    private helpers: HelpersService
  ) {}

  ngOnInit() {}
  back() {
    this.navCtrl.pop();
  }

  nav(route: string) {
    this.navCtrl.navigateForward(route);
  }

  logOut() {
    this.authService.logOut();
  }

  async disableAccount() {
    const alert = await this.alertCtrl.create({
      header: 'تعطيل الحساب',
      message: 'هل انت متأكد من تعطيل الحساب',
      mode: 'ios',
      buttons: [
        {
          text: 'لا',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          },
        },
        {
          text: 'نعم',
          handler: () => {
            this.dataService
              .editData(`/user/update/${this.authService.userData?._id}`, {
                status: 3,
              })
              .subscribe(
                (res) => {
                  // this.authService.userData = res;
                  this.authService.logOut();
                  this.helpers.presentToast('تم تعطيل الحساب');
                },
                (err) => {
                  this.helpers.presentToast('حدث خطأ');
                }
              );
          },
        },
      ],
    });
    await alert.present();
  }
}
