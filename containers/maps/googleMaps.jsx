/* eslint-disable react/prefer-stateless-function */
/* eslint-disable no-undef */
import { Component } from 'react';
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react'
import firebase from '../../containers/firebase/firebase';
import _ from 'lodash';

let originMarker = {};
export class MapContainer extends Component {
  state = {
    directions: null,
    origin: this.props.origin,
    destination: this.props.destination
  };

  onMapReady = (mapProps, map) => {
    //instantiate directions service and directions renderer
    const directionsService = new google.maps.DirectionsService();
    const directionsDisplay = new google.maps.DirectionsRenderer({ suppressMarkers: true });
    //put directions renderer to render in the map
    directionsDisplay.setMap(map);
    // directions requests

    firebase.firestore()
      .collection('RestaurantCollection')
      .doc(`Restaurants-${this.props.tenantId}`)
      .collection('BranchCollection')
      .doc(`Branch-${this.props.branch}`)
      .collection('orders')
      .where('OrderId', '==', this.props.orderId)
      .onSnapshot((querySnapshot) => {
        querySnapshot.forEach((doc) => {

          if (!_.has(doc.data(), 'Location')) {
            return;
          }
          
          let request = {
            origin: {
              lat: doc.data()?.Location?.latitude,
              lng: doc.data()?.Location?.longitude
            },
            destination: this.props.destination,
            travelMode: "DRIVING",
          };
          //show results in the directionsrenderer
          directionsService.route(request, (result, status) => {
            if (status == "OK") {
              directionsDisplay.setDirections(result);
              var leg = result.routes[0].legs[0];

              if (originMarker && typeof originMarker.setMap === 'function') {
                originMarker.setMap(null);
              }

              originMarker = new google.maps.Marker({
                position: leg.start_location,
                map: map,
                icon: {
                  url:
                    "https://images.vexels.com/media/users/3/154573/isolated/preview/bd08e000a449288c914d851cb9dae110-hatchback-car-top-view-silhouette-by-vexels.png",
                  scaledSize: new window.google.maps.Size(40, 40),
                  anchor: { x: 10, y: 10 }
                },
                title: "Delivery"
              });
              new google.maps.Marker({
                position: leg.end_location,
                map: map,
                icon: {
                  url:
                    "/images/icon/user-map-location-svgrepo-com.svg",
                  scaledSize: new window.google.maps.Size(20, 20),
                  anchor: { x: 0, y: 0 }
                },
                title: "Customer"
              });

            }
          });
        });
      });
  };

  render() {
    return (
      <div>
        <Map
          className="map"
          initialCenter={this.props.destination}
          google={this.props.google}
          onClick={this.onMapClicked}
          onReady={this.onMapReady}
          style={{ height: "100%", position: "relative", width: "100%" }}
          containerStyle={{
            position: 'relative',
            width: '100%',
            height: '100vh',
          }}
          zoom={8}
        ></Map>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: `${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`,
  version: "3.40",
})(MapContainer);
