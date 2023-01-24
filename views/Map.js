import React, { useContext, useEffect, useState, createRef } from 'react';
import MapView, { Geojson, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Modal, StyleSheet, Text, Pressable, View } from 'react-native';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Map = props => {

  const API_URI = 'http://data.foli.fi/';

  const { setSelectedStop, routeData } = useContext(UserContext);

  const mapView = createRef();
  //Function to center the map to certain point.
  const animateMap = (lon, lat) => {
    mapView.current.animateToRegion({
      longitude: lon,
      latitude: lat,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 500);
  }

  //Initial map position
  const initialRegion = {
    latitude: 60.445157729650454,
    latitudeDelta: 0.2,
    longitude: 22.272287160158157,
    longitudeDelta: 0.2,
  };

  const [bounds, setBounds] = useState();
  const [stops, setStops] = useState([]);
  const [currentStops, setCurrentStops] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState();
  
  // Function prompts user to give location access to the application.
  // TODO: Functionality for this data is not yet implemented
  /*const requestLocationData = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Föli light location permission',
          message:
            'Föli light needs access to your position ' +
            'so it can dispalay your location',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
    } catch (err) {
      console.warn(err);
    }
  };
  */

  // first stop data is fetched
  // Then fölis map border is fetched
  useEffect(() => {
    async function fetchStopData() {
      const stopResult = await axios.get(`${API_URI}gtfs/stops`)
      const keys = Object.keys(stopResult.data);
      if (keys) {
        let tempStopList = [];
        for (let index = 0; index < keys.length; index++) {
          const element = keys[index];
          tempStopList.push(stopResult.data[element]);
        }
        setStops(tempStopList);
      }
     
    }
    fetchStopData();
    fetch(`${API_URI}geojson/bounds`)
      .then(response => response.json())
      .then((responseJson) => {
        setBounds(responseJson);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [])

  useEffect(() => {
    if (routeData?.features[0]?.properties.stopData) {
      const coords = routeData?.features[0]?.properties.stopData;
      animateMap(coords.lon, coords.lat);
    }
  }, [routeData])

  useEffect(() => {
    fetchStops(initialRegion);
  }, [stops])


  function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  //This function returns distance of certain point from the center of the map.
  //Point is displayed on the map if the distance is closer than 800m
  //This is done to improve map performance.
  function distanceInMetersBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
    const earthRadiusKm = 6371;

    const dLat = degreesToRadians(lat2 - lat1);
    const dLon = degreesToRadians(lon2 - lon1);

    lat1 = degreesToRadians(lat1);
    lat2 = degreesToRadians(lat2);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (earthRadiusKm * c) * 1000;
  }

  function isInCircle(stop, center) {
    const distance = distanceInMetersBetweenEarthCoordinates(stop.stop_lat, stop.stop_lon, center.latitude, center.longitude);
    return distance <= 800;
  }

  // This fetches the stops inside the certain circle
  function fetchStops(center) {
    const stopsInsideTheArea = [];
    for (let index = 0; index < stops.length; index++) {
      const element = stops[index];
      if (isInCircle(element, center)) stopsInsideTheArea.push(element);
    }
    setCurrentStops(stopsInsideTheArea);
  }

  return (
    <>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={[styles.modalText, styles.bold]}>{modalData?.stop_name || ' - '} </Text>
            <Text style={styles.modalText}>Stop Number: <Text style={styles.bold}>{modalData?.stop_code || ' - '}</Text> </Text>
            <View style={styles.buttonWrapper}>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => { setModalVisible(!modalVisible); setModalData() }}>
                <Text style={styles.textStyle}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.buttonOpen]}
                onPress={() => {
                  setModalVisible(!modalVisible);
                  setSelectedStop(modalData);
                  setModalData();
                  props.navigation.navigate('Main');
                }}>
                <Text style={styles.textStyle}>Open schedule</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <MapView
        clusterColor={'#F0B32344'}
        onRegionChangeComplete={e => fetchStops(e)}
        style={{ flex: 1 }}
        initialRegion={initialRegion}
        provider={PROVIDER_GOOGLE}
        ref={mapView}
      >
        {
          currentStops && currentStops.map((e) => {
            return (
              <Marker
                key={`${e.stop_lat}${e.stop_lon}`}
                coordinate={{ latitude: e.stop_lat, longitude: e.stop_lon }}
                onPress={() => { setModalData(e); setModalVisible(true) }}
                tracksViewChanges={false}
              >
                <Ionicons name={'ellipse'} color={'#F0B323'} />
              </Marker>
            )
          })
        }

        {
          bounds && <Geojson
            geojson={bounds}
            strokeColor={'#0000ff'}
          />
        }

        {
          routeData && <Geojson
            geojson={routeData}
            strokeWidth={3}
            strokeColor={'#FF0000'}
          />
        }

      </MapView>
    </>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    margin: 5,
    backgroundColor: '#F0B323',
  },
  buttonClose: {
    margin: 5,
    backgroundColor: '#2196F3',
  },
  buttonWrapper: {
    flexDirection: 'row',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  bold: {
    fontWeight: '700',
  }
});

export default Map;
