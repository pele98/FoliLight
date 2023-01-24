import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { UserContext } from '../context/UserContext';
import SearchBarComponent from '../components/SearchBar';
import CardComponent from '../components/CardComponent';

const Main = props => {

  const API_URI = 'http://data.foli.fi/';

  const { stopData, setStopData, selectedStop, setSelectedStop, setRouteData } = useContext(UserContext);
  const [currentStopSchedule, setCurrentStopSchedule] = useState([]);
  const [busNumbers, setBusNumbers] = useState([]);

  useEffect(() => {
    if (selectedStop) {
      setStopData(selectedStop);
      setSelectedStop();
      setRouteData();
    }
  }, [selectedStop])

  useEffect(() => {
    if (stopData && stopData.stop_code) {
      fetch(`${API_URI}siri/sm/${stopData.stop_code}/pretty`)
        .then(response => response.json())
        .then((responseJson) => {
          //Data is grouped by the stop number
          //This makes data handling easier later.
          const groupedData = responseJson.result.reduce(function (r, a) {
            r[a.lineref] = r[a.lineref] || [];
            r[a.lineref].push(a);
            return r;
          }, Object.create(null));
          setCurrentStopSchedule(groupedData);
          setBusNumbers(Object.keys(groupedData));
          setRouteData();
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [stopData])


  return (
    <View style={styles.body}>
      <SearchBarComponent />
      <ScrollView style={styles.scrollView}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.scrollWrapper}>
            {busNumbers.length > 0 && busNumbers.map(number => {
              return (
                <CardComponent key={'main' + number} data={currentStopSchedule[number]} number={number} props={props}/>
              )
            })}
          </View>
        </ScrollView>
      </ScrollView>
      <View style={{ flex: 1 }} />
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
});

export default Main;
