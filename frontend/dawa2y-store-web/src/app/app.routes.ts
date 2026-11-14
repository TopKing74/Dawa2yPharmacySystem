import { Routes } from '@angular/router';
import { HomeComponent } from './components/home.component';
import { ProductListComponent } from './components/product-list.component';
import { ProductDetailComponent } from './components/product-detail.component';
import { CartComponent } from './components/cart.component';
import { CheckoutComponent } from './components/checkout.component';
import { OrderConfirmationComponent } from './components/order-confirmation.component';
import { BranchesComponent } from './components/branches.component';
import { OrderTrackingComponent } from './components/order-tracking.component';
import { AuthComponent } from './components/auth.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'products', component: ProductListComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'order-confirmation/:id', component: OrderConfirmationComponent },
  { path: 'branches', component: BranchesComponent },
  { path: 'track', component: OrderTrackingComponent },
  { path: 'auth', component: AuthComponent },
  { path: '**', redirectTo: '' }
];
