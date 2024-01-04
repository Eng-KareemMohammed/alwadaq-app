import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {
  constructor(
    private navCtrl: NavController,
    public authService: AuthService
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
}
