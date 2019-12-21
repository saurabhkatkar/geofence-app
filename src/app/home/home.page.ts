import { Component, OnInit,ViewChild, ElementRef } from '@angular/core';
    import { NavController, Platform } from '@ionic/angular';
    import { MapsAPILoader } from '@agm/core';
    import { HttpClientModule, HttpClient } from '@angular/common/http';
    import { Geolocation } from '@ionic-native/geolocation/ngx';
    import { Geofence } from '@ionic-native/geofence/ngx';
    import { v4 } from 'uuid';
    import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';

    declare const google;
    @Component({
      selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
    })
    export class HomePage implements OnInit {
      @ViewChild('map',{static:false}) mapElement: ElementRef;
      map: any;
      address:string;
      constructor(
        public navCtrl: NavController,
        private loader: MapsAPILoader,
        private http: HttpClient,
        private platform: Platform,
        private geolocation: Geolocation,
        private geofence: Geofence,
        private nativeGeocoder: NativeGeocoder
      ) {
        if (this.platform.is('cordova')) {
          this.platform.ready().then((_) => {
            geofence.initialize().then((_) => {
              console.log('Geofence Plugin Ready');
            });
          });
        }
      }
      center = {
        lat: 6.4393477,
        lng: 3.5244628999999996,
      };
      zoom = 15;
      state = '';

      pingLocation(location) {
        console.log('ping location : ',location);
        this.http
          .post('http://localhost:4000/ping', location)
          .subscribe((res) => {});
      }
      notify(location) {
        this.http
          .post('http://localhost:4000/notify', location)
          .subscribe((res) => {});
      }

      // Same function like code in reverseGeocode
      reverseGeocode(latLng) {
        const geocoder = new google.maps.Geocoder(); //this uses gmaps geocoding which is paid service
        geocoder.geocode({ location: latLng }, (results, status) => {
          if (status === 'OK') {
            if (results[0]) {
              const address = results[0].formatted_address;
              const addressList = address.split(',');
              this.address = addressList[0];
              this.state = addressList.slice(2).join(', ');
            }
          }
        });
      }
      //Till this


      private createGeofence() {
        let fence = {
          id: v4(), //any unique ID
          latitude: this.center.lat, //center of geofence radius
          longitude: this.center.lng,
          radius: 1000, //radius to edge of geofence in meters
          transitionType: 2,
        };
        this.geofence
          .addOrUpdate(fence)
          .then(
            () => console.log('Geofence added'),
            (err) => console.log('Geofence failed to add', err)
          );
        this.geofence.onTransitionReceived().subscribe((res) => {
          this.notify(this.center);
        });
      }

      ngOnInit(){
        this.loadMap();
        this.loader.load().then(() => {
          // this.reverseGeocode(this.center); //Replace This with native geocode
          // this.pingLocation(this.center); 
        });
        this.platform.ready().then(() => {
          if (this.platform.is('cordova')) {
            this.createGeofence();
            const watch = this.geolocation.watchPosition ();
            watch.subscribe((position) => {
              const positionEmpty = Object.keys(position).length < 1;
              if (!positionEmpty) {
                this.center = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                };
                // this.reverseGeocode(this.center);
                // this.pingLocation(this.center);
              }
            });
          }
          else{
            console.log("This is platform ready function");
            console.log("Cordova is NOT AVAILABLE");
          }
        });
      }

      loadMap() {
        this.geolocation.getCurrentPosition().then((resp) => {
          let latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
          let mapOptions = {
            center: latLng,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          }
     
          this.getAddressFromCoords(resp.coords.latitude, resp.coords.longitude);
     
          this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
     
          this.map.addListener('tilesloaded', () => {
            console.log('accuracy',this.map);
            this.getAddressFromCoords(this.map.center.lat(), this.map.center.lng())
          });
     
        }).catch((error) => {
          console.log('Error getting location', error);
        });
      }
     
      getAddressFromCoords(lattitude, longitude) {
          
          console.log("getAddressFromCoords "+lattitude+" "+longitude);
          let options: NativeGeocoderOptions = {
            useLocale: true,
            maxResults: 5
          };

      //This is Cordova Plugin . Will Not Work ON BROWSER
          this.nativeGeocoder.reverseGeocode(lattitude, longitude, options)
            .then((result: NativeGeocoderResult[]) => {
              console.log("Reverse Geocode:" ,result);
              this.address = "";
              let responseAddress = [];
              for (let [key, value] of Object.entries(result[0])) {
                if(value.length>0)
                responseAddress.push(value);
      
              }
              for (let value of responseAddress) {
                this.address += value+", ";
              }
              this.address = this.address.slice(0, -2);
    
            })
            .catch((error: any) =>{ 
              this.address = "Address Not Available!";
            });
      
        }
    }