import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Events } from 'src/app/enums/events';
import { DataService } from 'src/app/services/data/data.service';
import { HelpersService } from 'src/app/services/helpers/helpers.service';

@Component({
  selector: 'app-members',
  templateUrl: './members.page.html',
  styleUrls: ['./members.page.scss'],
})
export class MembersPage implements OnInit {
  clients: any[] = [];
  searchText: string = '';
  skip: number = 0;
  loading: boolean = true;
  emptyView: boolean = false;
  errorView: boolean = false;
  disableScroll: boolean = false;
  selectedClient: any = null;

  eventSubscription: Subscription;
  constructor(
    private navCtrl: NavController,
    private helpers: HelpersService,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.getClients();
    this.eventSubscription = this.helpers
      .onChangeEvent()
      .subscribe((eventName) => {
        console.log(eventName);
        if (eventName == Events.refreshUsers) {
          this.getClients();
        }
      });
  }
  ionViewWillEnter() {}

  getClients(ev?: any) {
    this.dataService.getData(this.endPoint).subscribe(
      (res: any) => {
        this.clients = this.skip ? this.clients.concat(res) : res;
        if (this.skip > 0 && res.length < 20) this.disableScroll = true;
        this.clients.length ? this.showContentView(ev) : this.showEmptyView(ev);
      },
      (err) => {
        this.showErrorView(ev);
      }
    );
  }
  get endPoint(): string {
    let url = `/user/all?type=1&status=1`;
    if (this.skip) url += `&skip=${this.skip}`;
    if (this.searchText) url += `&searchText=${this.searchText}`;
    // if (this.selectedZone) url += `&zone_id=${this.selectedZone}`;
    return url;
  }
  nav(route: string) {
    this.navCtrl.navigateForward(route);
  }

  update(id, status) {
    if (status == 2) {
      if (this.selectedClient.attachment.length < 3)
        return this.helpers.presentToast('يجب اضافة البيانات اولا');
    }
    this.dataService
      .editData(`/user/update/${id}`, { status })
      .subscribe((res: any) => {
        console.log(res);
        if (status == 2) {
          this.addOrder(res);
        }
        this.getClients();
      });
  }
  addOrder(res) {
    this.dataService
      .postData('/order', {
        service_id: '658b061e3f1f25c5ae29ad87',
        client_id: res._id,
        location: res.location,
        zone_id: res.zone_id._id,
        status: 1,
      })
      .subscribe((res: any) => {
        console.log(res);
      });
  }
  doRefresh(ev?: any) {
    this.skip = 0;
    this.getClients(ev);
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
  loadData(ev: any) {
    this.skip += 1;
    this.getClients(ev);
  }
}
