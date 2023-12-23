import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Events } from 'src/app/enums/events';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DataService } from 'src/app/services/data/data.service';
import { HelpersService } from 'src/app/services/helpers/helpers.service';
import { LocationService } from 'src/app/services/location/location.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit {
  status = 1;
  orders: any[] = [];
  skip: number = 0;
  loading: boolean = true;
  emptyView: boolean = false;
  errorView: boolean = false;
  active: boolean;
  disable: boolean = false;
  eventSubscription: Subscription;

  location: any;
  constructor(
    private navCtrl: NavController,
    private dataService: DataService,
    private helpers: HelpersService,
    private authService: AuthService,
    private locationService: LocationService
  ) {}

  async ngOnInit() {
    this.location = await this.locationService.getCurrentLocation();
    this.active = this.authService.userData?.active;
    this.getOrders();
    this.eventSubscription = this.helpers
      .onChangeEvent()
      .subscribe((eventName) => {
        console.log(eventName);
        if (eventName == Events.refreshOrders) {
          this.getOrders();
        }
      });
  }
  ionViewWillEnter() {
    // this.active = this.authService.userData?.active;
    // console.log(this.authService.userData);
  }

  getOrders(ev?: any) {
    this.loading = true;
    this.emptyView = false;
    this.errorView = false;

    this.dataService.getData(this.endPoint).subscribe(
      (res: any) => {
        this.orders = this.skip ? this.orders.concat(res) : res;
        this.loading = false;
        if (this.orders.length == 0) this.emptyView = true;
        if (ev) ev.target.complete();
        if (res.length == 0) {
          if (ev) ev.target.disabled = true;
          this.disable = true;
        }
      },
      (err) => {
        this.loading = false;
        this.errorView = true;
        if (ev) ev.target.complete();
      }
    );
  }
  get endPoint(): string {
    let url = `/order`;
    if (this.status != null) url += `&status=${this.status}`;
    if (this.status == null) url += `&new=true`;
    if (this.skip) url += `&skip=${this.skip}`;
    // if (this.selectedZone) url += `&zone_id=${this.selectedZone}`;
    return url.replace('&', '?');
  }

  doRefresh(ev?: any) {
    this.skip = 0;
    this.getOrders(ev);
  }
  loadData(ev: any) {
    this.skip += 1;
    this.getOrders(ev);
  }
  nav(route: string) {
    this.navCtrl.navigateForward(route);
  }
  trackFn(item) {
    return item._id;
  }

  accept(order) {
    this.dataService
      .editData(`/order/${order._id}`, {
        status: 2,
        total_price: order.service_id.price - order.service_id.discount_amount,
        total_delegate:
          (order.service_id.price - order.service_id.discount_amount) *
          order.service_id.delegate_commission,
        zone_id: this.authService?.userData.zone_id,
      })
      .subscribe((res) => {
        this.helpers.presentToast('تم قبول الطلب');
        this.skip = 0;
        this.getOrders();
      });
  }

  // finish(order) {
  //   this.dataService
  //     .editData(`/order/${order._id}`, {
  //       status: 3,
  //     })
  //     .subscribe((res) => {
  //       this.helpers.presentToast('تم قبول الطلب');
  //       this.getOrders();
  //     });
  // }
  logOut() {
    this.authService.logOut();
  }
  activeChange(ev: any) {
    console.log(ev);
    this.dataService
      .editData('/user/changeStatus', {
        active: ev,
      })
      .subscribe((res: any) => {
        console.log('change status', res);
        this.authService.updateUserData(ev);
      });
  }
  details(order) {
    this.dataService.setParams({ order });
    this.navCtrl.navigateForward('/order-details');
  }
  async finish(order) {
    let distance = getDistance(this.location, order.client_id.location);
    let sameZone = order.zone_id._id == this.authService.userData.zone_id;
    if (!sameZone || distance > 500)
      return this.helpers.presentToast(
        'لا يمكنك انهاء الطلب لانك لست في نفس المنطقة'
      );
    await this.helpers.showLoading();
    var nowDate = new Date();
    var numberOfDaysToAdd = order.service_id.alert_days;
    var reminder_date = nowDate.setDate(nowDate.getDate() + numberOfDaysToAdd);
    this.dataService
      .editData(`/order/${order._id}`, {
        status: 3,
        reminder_date,
      })
      .subscribe(
        (res) => {
          this.helpers.dismissLoading();
          this.helpers.presentToast('تم انهاء الطلب');
          this.getOrders();
        },
        (err) => {
          this.helpers.dismissLoading();
          this.helpers.presentToast('حدث خطأ ما');
        }
      );
  }
}
var rad = function (x) {
  return (x * Math.PI) / 180;
};

var getDistance = function (p1, p2) {
  var R = 6378137; // Earth’s mean radius in meter
  var dLat = rad(p2.lat - p1.lat);
  var dLong = rad(p2.lng - p1.lng);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(p1.lat)) *
      Math.cos(rad(p2.lat)) *
      Math.sin(dLong / 2) *
      Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d; // returns the distance in meter
};
