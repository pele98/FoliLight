import React, { useContext } from 'react';
import { View, Text, StyleSheet, Pressable} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserContext } from '../context/UserContext';
import { format, fromUnixTime } from 'date-fns'
import axios from 'axios';
import { Card } from '@rneui/themed';

const CardComponent = props => {

  const API_URI = 'http://data.foli.fi/';

  const { setRouteData } = useContext(UserContext);

  async function showOnMap() {
    //First trip data is fetched with __tripref key
    //Then routes location information is fetched with that data.
    //lastly route data is saved as GeoJson to Context.
    const tripData = await axios.get(`${API_URI}gtfs/trips/trip/${props.data[0].__tripref}`);
    if (tripData.status === 200) {
      const shapeData = await axios.get(`${API_URI}gtfs/shapes/${tripData.data[0].shape_id}`);
      if (shapeData.data) {
        const coordinatesArray = [];
        for (let index = 0; index < shapeData.data.length; index++) {
          const coord = shapeData.data[index];
          if (coord.lon && coord.lat) coordinatesArray.push([coord.lon, coord.lat]);
        }
        setRouteData({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {
                stopData: {lat: props.data[0].latitude, lon: props.data[0].longitude}
              },
              geometry: {
                coordinates: coordinatesArray,
                type: "LineString",
              }
            }
          ]
        });
        props.props.navigation.navigate('Map');
      }
    }
  }

  return (
    props.data &&
    <View style={styles.cardWrapper}>
      <Card containerStyle={styles.headerCard} key={props.number}>
        <Card.Title>{props.data[0] ? props?.data[0]?.destinationdisplay : ' - '} </Card.Title>
        <Card.Title>{props?.number} </Card.Title>
        <Pressable
          style={[styles.route]}
          onPress={() => showOnMap()}>
          <Text style={styles.textStyle}>Show route on map <Ionicons name={'map-outline'} color={'#000'}/> </Text>
        </Pressable>
      </Card>
      {
        props.data.map((cardData, index) => {
          return (
            <Card key={props.number + '_index_' + index} containerStyle={styles.subCard} >
              <Card.Title >Arrival: {format(new Date(fromUnixTime(cardData.aimedarrivaltime)), 'HH:mm')} </Card.Title>
              <Text>Excpected arrival: {format(new Date(fromUnixTime(cardData.expectedarrivaltime)), 'HH:mm')} </Text>
              <Text>Delay: {cardData.delay ? `${Math.floor(cardData.delay / 60)} minutes` : ' - '}</Text>
            </Card>
          )
        })
      }
    </View>

  );
};

const styles = StyleSheet.create({
  body: {
    flex: 1
  },
  itemStyle: {
    padding: 10,
  },
  scrollWrapper: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'nowrap'
  },
  headerCard: {
    borderRadius: 5,
    backgroundColor: '#F0B323',
    paddingTop: 10,
    paddingBottom: 0,
  },
  subCard: {
    borderRadius: 5,
  },
  cardWrapper: {
    minWidth: 230,
  },
  route: {
    alignItems: 'center',
    marginBottom: 10,
  },
  textStyle: {
    color: '#ffffffee'
  }
});

export default CardComponent;
