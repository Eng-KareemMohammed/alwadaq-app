import { Component, OnInit } from '@angular/core';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { AlertController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DataService } from 'src/app/services/data/data.service';
import { HelpersService } from 'src/app/services/helpers/helpers.service';
import { LocationService } from 'src/app/services/location/location.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  isModelOpen = false;
  selectedService: any = null;
  services: any[] = [];
  location: any;
  constructor(
    public authService: AuthService,
    private dataService: DataService,
    private helpers: HelpersService,
    private iab: InAppBrowser,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private locationService: LocationService
  ) {}

  async ngOnInit() {
    this.getServices();
    this.location = await this.locationService.getCurrentLocation();
    console.log(this.location);
  }
  getServices() {
    let url = `/services`;
    this.dataService.getData(url).subscribe(
      (res: any) => {
        this.services = res;
      },
      (e) => {
        this.helpers.presentToast('حدث خطأ ما');
      }
    );
  }
  logOut() {
    this.authService.logOut();
  }
  nav(route) {
    this.navCtrl.navigateForward(route);
  }
  doRefresh(ev: any) {
    this.getServices();
    this.authService.userStatus();
    ev.target.complete();
  }
  call() {
    this.iab.create(`tel:07800880055`, '_system');
  }
  confirmOrder() {
    if (!this.selectedService)
      return this.helpers.presentToast('من فضلك اختر الخدمة المطلوبة');
    if (this.selectedService) {
      this.dataService.getData('/order/canOrder').subscribe((res) => {
        if (res == false) {
          return this.helpers.presentToast(
            'لا يمكنك اضافة طلب قبل مرور 24 ساعة علي طلبك الاخير'
          );
        } else {
          this.dataService
            .postData('/order', { service_id: this.selectedService })
            .subscribe(
              (res: any) => {
                console.log(res);
                this.isModelOpen = false;
                this.selectedService = null;
                this.helpers.presentToast('تم ارسال طلبك بنجاح');
              },
              (err) => {
                this.helpers.presentToast(
                  `خطأ بالشبكة حاول مرة اخري ${err.error}}`
                );
              }
            );
        }
      });
    }
  }

  placeeOrder() {
    if (this.authService.userData.lastOrder) {
      this.selectedService = this.authService.userData.lastOrder.service_id;
      this.confirmOrder();
    } else {
      this.isModelOpen = true;
    }
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
