import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { Geofence } from '@ionic-native/geofence/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { AgmCoreModule } from '@agm/core';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule,HttpClientModule,
    AgmCoreModule.forRoot({
      // please add your own API key here: https://developers.google.com/maps/documentation/javascript/get-api-key?hl=en
      apiKey: 'GOOGLE_API_KEY',
      libraries: ['geometry'],
    }),],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    Geolocation,
    HttpClient,
    Geofence,
    NativeGeocoder,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
