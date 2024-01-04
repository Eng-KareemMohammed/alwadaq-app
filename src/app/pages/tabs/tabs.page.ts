import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Events } from 'src/app/enums/events';
import { HelpersService } from 'src/app/services/helpers/helpers.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {
  constructor(private helpers: HelpersService) {}

  ngOnInit() {}
  change(event) {
    console.log(event);
    if (event.tab == 'home') this.helpers.emitEvent(Events.refreshHome);
    // if (event.tab == 'clients') this.helpers.emitEvent(Events.refreshUsers);
    // if (event.tab == 'members') this.helpers.emitEvent(Events.refreshUsers);
    // if (event.tab == 'delegates') this.helpers.emitEvent(Events.refreshDelegates);
    // if (event.tab == 'orders') this.helpers.emitEvent(Events.refreshOrders);
    if (event.tab == 'news') this.helpers.emitEvent(Events.refreshNews);
  }
}
