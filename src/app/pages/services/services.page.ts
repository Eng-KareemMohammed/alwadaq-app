import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { DataService } from 'src/app/services/data/data.service';

@Component({
  selector: 'app-services',
  templateUrl: './services.page.html',
  styleUrls: ['./services.page.scss'],
})
export class ServicesPage implements OnInit {
  loading: boolean = true;
  emptyView: boolean = false;
  errorView: boolean = false;
  services: any[] = [];
  skip: number = 0;
  disableScroll: boolean = false;

  constructor(
    private navCtrl: NavController,
    private dataService: DataService
  ) {}

  ngOnInit() {
    // this.getServices();
  }

  ionViewWillEnter() {
    this.getServices();
  }
  getServices(ev?: any) {
    let url = `/services?skip=${this.skip}`;
    this.dataService.getData(url).subscribe(
      (res: any) => {
        this.services = this.skip ? this.services.concat(res) : res;
        if (this.skip > 0 && res.length < 20) this.disableScroll = true;
        this.services.length
          ? this.showContentView(ev)
          : this.showEmptyView(ev);
      },
      (e) => {
        this.showEmptyView(e);
      }
    );
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
  nav(route: string) {
    this.navCtrl.navigateForward(route);
  }
  edit(service) {
    this.dataService.params.service = service;
    // this.navCtrl.navigateForward('/add-service');
  }
  doRefresh(ev?: any) {
    this.skip = 0;
    this.getServices();
    if (ev) {
      ev.target.complete();
    }
  }
  loadData(ev: any) {
    this.skip += 1;
    this.getServices(ev);
  }
}
