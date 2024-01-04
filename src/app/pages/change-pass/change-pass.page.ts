import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data/data.service';
import { HelpersService } from 'src/app/services/helpers/helpers.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-change-pass',
  templateUrl: './change-pass.page.html',
  styleUrls: ['./change-pass.page.scss'],
})
export class ChangePassPage implements OnInit {
  showPassword: boolean = false;
  password;
  confirmPassword;
  constructor(
    private dataService: DataService,
    private helpers: HelpersService,
    private authService: AuthService
  ) {}

  ngOnInit() {}

  async submit() {
    if (this.password != this.confirmPassword) {
      return this.helpers.presentToast('كلمة المرور غير متطابقة');
    }
    await this.helpers.showLoading('جاري تحديث البيانات');
    this.authService.updateUser({ password: this.password });
  }
}
