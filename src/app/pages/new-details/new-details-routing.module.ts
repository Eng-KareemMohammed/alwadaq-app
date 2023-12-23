import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewDetailsPage } from './new-details.page';

const routes: Routes = [
  {
    path: '',
    component: NewDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewDetailsPageRoutingModule {}
