import { Routes } from '@angular/router';
import { AdminLoginComponent } from './components/admin-login.component';
import { AdminLayoutComponent } from './components/admin-layout.component';
import { DashboardOverviewComponent } from './components/dashboard-overview.component';
import { ProductsManagerComponent } from './components/products-manager.component';
import { InventoryManagerComponent } from './components/inventory-manager.component';
import { OrdersManagerComponent } from './components/orders-manager.component';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: 'login', component: AdminLoginComponent },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', component: DashboardOverviewComponent },
      { path: 'products', component: ProductsManagerComponent },
      { path: 'inventory', component: InventoryManagerComponent },
      { path: 'orders', component: OrdersManagerComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
