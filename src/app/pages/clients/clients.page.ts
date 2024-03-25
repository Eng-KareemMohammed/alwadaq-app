import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { IonPopover, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Events } from 'src/app/enums/events';
import { DataService } from 'src/app/services/data/data.service';
import { HelpersService } from 'src/app/services/helpers/helpers.service';
import { LocationService } from 'src/app/services/location/location.service';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.page.html',
  styleUrls: ['./clients.page.scss'],
})
export class ClientsPage implements OnInit {
  clients: any[] = [];
  searchText: string = '';
  skip: number = 0;
  loading: boolean = true;
  emptyView: boolean = false;
  errorView: boolean = false;
  @ViewChild('popover') popover: IonPopover;
  isOpen: boolean = false;
  isModelOpen = false;
  selectedService: any = null;
  services: any[] = [];
  selectedClient: any = null;
  eventSubscription: Subscription;
  disableScroll: boolean = false;
  isModalHouseFacadeOpen: boolean = false;
  @ViewChild('zoomImage', { static: false }) zoomImage: ElementRef;
  zoomed = false;
  contentHeight: number;
  alertStatus;
  status = 2;
  filteredClients: any[] = [];

  constructor(
    private navCtrl: NavController,
    private helpers: HelpersService,
    private dataService: DataService,
    private locationService: LocationService,
    private iab: InAppBrowser
  ) {}

  ngOnInit() {
    this.getClients();
    this.getServices();
    this.eventSubscription = this.helpers
      .onChangeEvent()
      .subscribe((eventName) => {
        console.log(eventName);
        if (eventName == Events.refreshUsers) {
          this.getClients();
        }
      });
  }

  ionViewWillEnter() {
    // this.getClients();
  }
  getClients(ev?: any) {
    this.dataService.getData(this.endPoint).subscribe(
      (res: any) => {
        this.clients = this.skip ? this.clients.concat(res) : res;
        if (this.skip > 0 && res.length < 20) this.disableScroll = true;
        this.clients.length ? this.showContentView(ev) : this.showEmptyView(ev);
        this.filteredClients =
          this.alertStatus != null
            ? this.clients.filter(
                (client) => client.alertStatus == this.alertStatus
              )
            : this.clients;
      },
      (err) => {
        this.showErrorView(err);
      }
    );
  }

  onSearchChange(ev: any) {
    this.getClients();
  }
  get endPoint(): string {
    let url = `/user/all?type=1`;
    if (this.skip) url += `&skip=${this.skip}`;
    if (this.searchText) url += `&searchText=${this.searchText}`;
    if (this.status) url += `&status=${this.status}`;

    // if (this.selectedZone) url += `&zone_id=${this.selectedZone}`;
    return url;
  }
  showContentView(ev?: any) {
    this.loading = false;
    this.errorView = false;
    this.emptyView = false;
    // this.disableInfinity = false;
    if (ev) ev.target.complete();
  }

  showErrorView(ev?: any) {
    this.loading = false;
    this.errorView = true;
    this.emptyView = false;
    if (ev) ev.target.complete();
  }

  showEmptyView(ev?: any) {
    this.loading = false;
    this.errorView = false;
    this.emptyView = true;
    if (ev) ev.target.complete();
  }
  doRefresh(ev?: any) {
    this.skip = 0;
    this.getClients(ev);
  }
  loadData(ev: any) {
    this.skip += 1;
    this.getClients(ev);
  }
  nav(route: string) {
    this.navCtrl.navigateForward(route);
  }

  presentPopover(e: Event, client: any) {
    this.popover.event = e;
    this.isOpen = true;
    this.selectedClient = client;
  }
  edit() {
    if (this.selectedClient.pendingUpdate) {
      this.helpers.presentToast(
        'يوجد طلب تعديل قيد الانتظار لا يمكنك اضافة طلب جديد'
      );
      this.popover.dismiss();
    } else {
      this.dataService.setParams({ client: this.selectedClient });
      this.popover.dismiss();
      this.navCtrl.navigateForward('/add-client');
    }
  }
  addOrder() {
    this.popover.dismiss();
    this.isModelOpen = true;
  }

  confirmOrder() {
    if (!this.selectedService)
      return this.helpers.presentToast('من فضلك اختر الخدمة المطلوبة');

    if (this.selectedService) {
      // this.dataService
      //   .postData('/order', {
      //     service_id: this.selectedService,
      // client_id: this.selectedClient._id,
      //               status: 2,
      //   })
      //   .subscribe((res: any) => {
      //     console.log(res);
      //     this.isModelOpen = false;
      //     this.selectedService = null;
      //     this.helpers.presentToast('تم ارسال طلبك بنجاح');
      //   });

      this.dataService
        .getData(`/order/canOrder?client_id=${this.selectedClient._id}`)
        .subscribe((res) => {
          if (res == false) {
            this.isModelOpen = false;
            return this.helpers.presentToast(
              'لا يمكنك اضافة طلب قبل مرور 24 ساعة علي طلبك الاخير'
            );
          } else {
            this.dataService
              .postData('/order', {
                service_id: this.selectedService,
                client_id: this.selectedClient._id,
                status: 2,
              })
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
  viewHouseFacade() {
    if (this.selectedClient.houseFacade) {
      this.isModalHouseFacadeOpen = true;
    } else {
      this.helpers.presentToast('لا يوجد صورة');
    }
    this.popover.dismiss();
  }

  handleZoom(event: MouseEvent): void {
    const imageElement = this.zoomImage.nativeElement as HTMLImageElement;

    const offsetX = event.clientX - imageElement.getBoundingClientRect().left;
    const offsetY = event.clientY - imageElement.getBoundingClientRect().top;

    if (this.zoomed) {
      imageElement.style.transform = 'scale(1)';
    } else {
      const scale = 2; // Adjust the scale factor as needed
      const translateX = offsetX + 100 - offsetX * scale;
      const translateY = offsetY + 100 - offsetY * scale;

      imageElement.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
    }

    this.zoomed = !this.zoomed;
  }

  changeStatus(alertStatus) {
    this.status = 2;
    this.alertStatus = alertStatus;
    this.getClients();
  }
  disActiveAcc() {
    this.status = 3;
    this.getClients();
  }

  call() {
    this.iab.create(`tel:${this.selectedClient.phone}`, '_system');
  }
  async openMap() {
    let location = this.selectedClient.location;
    // let currentLocation = await this.locationService.getCurrentLocation();
    if (!location || location == undefined)
      return this.helpers.presentToast('لا يوجد موقع للعميل');
    let currentLocation = await this.locationService.getCurrentLocation();
    console.log(location, 'location');
    console.log(currentLocation, 'currentLocation');

    const url = `https://www.google.com/maps/dir/${currentLocation.lat},${currentLocation.lng}/${location.lat},${location.lng}`;

    // await Browser.open({
    //   url: `https://www.google.com/maps/dir/${currentLocation.lat},${currentLocation.lng}/${location[1]},${location[0]}`,
    // });
    this.iab.create(url, '_system');
  }
}
