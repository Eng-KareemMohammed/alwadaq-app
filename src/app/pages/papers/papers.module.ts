import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PapersPageRoutingModule } from './papers-routing.module';

import { PapersPage } from './papers.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PapersPageRoutingModule
  ],
  declarations: [PapersPage]
})
export class PapersPageModule {}
