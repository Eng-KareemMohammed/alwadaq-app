import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data/data.service';
import { HelpersService } from '../../services/helpers/helpers.service';
import { Events } from 'src/app/enums/events';

@Component({
  selector: 'app-news',
  templateUrl: './news.page.html',
  styleUrls: ['./news.page.scss'],
})
export class NewsPage implements OnInit {
  loading: boolean = true;
  emptyView: boolean = false;
  errorView: boolean = false;
  news: any[] = [];
  skip: number = 0;

  eventSubscription: Subscription;

  constructor(
    private navCtrl: NavController,
    private dataService: DataService,
    private helpers: HelpersService
  ) {}

  ngOnInit() {
    this.getNews();
    this.eventSubscription = this.helpers
      .onChangeEvent()
      .subscribe((eventName) => {
        console.log(eventName);
        if (eventName == Events.refreshUsers) {
          this.getNews();
        }
      });
  }

  ionViewWillEnter() {}

  getNews(ev?: any) {
    this.loading = true;
    this.emptyView = false;
    this.errorView = false;
    let url = `/news?skip=${this.skip}`;
    this.dataService.getData(url).subscribe(
      (res: any) => {
        this.loading = false;
        this.news = res;
        if (this.news.length == 0) this.emptyView = true;
        if (ev) ev.target.complete();
      },
      (e) => {
        this.loading = false;
        this.errorView = true;
        if (ev) ev.target.complete();
      }
    );
  }
  edit(news) {
    this.dataService.params.news = news;
    this.navCtrl.navigateForward('/add-new');
  }
  doRefresh(ev?: any) {
    this.skip = 0;
    this.getNews(ev);
  }
  nav(route: string) {
    this.navCtrl.navigateForward(route);
  }
  loadData(ev: any) {
    this.skip += 1;
    this.getNews(ev);
  }
}
