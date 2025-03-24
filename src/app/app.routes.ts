import { Routes } from '@angular/router';
import { ContactComponent } from './contact/contact.component';

export const routes: Routes = [
    { path : 'contact' , component : ContactComponent },
    { path : '' , redirectTo : '/contact', pathMatch : 'full' }
];
