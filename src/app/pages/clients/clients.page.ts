import { Component, OnInit, ViewChild } from '@angular/core';
import { IonPopover, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Events } from 'src/app/enums/events';
import { DataService } from 'src/app/services/data/data.service';
import { HelpersService } from 'src/app/services/helpers/helpers.service';

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

  constructor(
    private navCtrl: NavController,
    private helpers: HelpersService,
    private dataService: DataService
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
    this.loading = true;
    this.emptyView = false;
    this.errorView = false;

    this.dataService.getData(this.endPoint).subscribe(
      (res: any) => {
        this.clients = this.skip ? this.clients.concat(res) : res;
        this.loading = false;
        if (this.clients.length == 0) this.emptyView = true;
        if (ev) ev.target.complete();
      },
      (err) => {
        this.loading = false;
        this.errorView = true;
        if (ev) ev.target.complete();
      }
    );
  }
  get endPoint(): string {
    let url = `/user/all?type=1&status=2`;
    if (this.skip) url += `&skip=${this.skip}`;
    if (this.searchText) url += `&searchText=${this.searchText}`;
    // if (this.selectedZone) url += `&zone_id=${this.selectedZone}`;
    return url;
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
    this.dataService.setParams({ client: this.selectedClient });
    this.popover.dismiss();
    this.navCtrl.navigateForward('/add-client');
  }
  addOrder() {
    this.popover.dismiss();
    this.isModelOpen = true;
  }

  confirmOrder() {
    if (this.selectedService) {
      console.log(this.selectedService);
      this.dataService
        .postData('/order', {
          service_id: this.selectedService,
          client_id: this.selectedClient._id,
          status: 2,
        })
        .subscribe((res: any) => {
          console.log(res);
          this.isModelOpen = false;
          this.selectedService = null;
          this.helpers.presentToast('تم ارسال طلبك بنجاح');
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
}
