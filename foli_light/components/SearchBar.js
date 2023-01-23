import React, { useState, useEffect, useContext } from 'react';
import { SearchBar } from '@rneui/themed';
import { Text, StyleSheet, View, FlatList } from 'react-native';
import { UserContext } from '../context/UserContext';

import getEnvVars from '../config';


const SearchBarComponent = props => {

  const { API_URI } = getEnvVars();

  const { stopData, setStopData } = useContext(UserContext);

  const [search, setSearch] = useState('');
  const [filteredDataSource, setFilteredDataSource] = useState([]);
  const [masterDataSource, setMasterDataSource] = useState([]);

  const [update, setUpdate] = useState(false);

  useEffect(() => {
    null;
  }, [update])

  useEffect(() => {
    fetch(`${API_URI}siri/sm/pretty`)
      .then(resonse => resonse.json())
      .then((responseJson) => {
        const keys = Object.keys(responseJson);
        let tempStopList = [];
        for (let index = 0; index < keys.length; index++) {
          const element = keys[index];
          tempStopList.push({ ...responseJson[element], stop_code: element })
        }
        setMasterDataSource(tempStopList);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const searchFilterFunction = (text) => {
    if (text) {
      const newData = masterDataSource.filter(function (item) {
        if (parseInt(text)) {
          const itemData = item.stop_code
          return itemData.indexOf(text) > -1;
        } else {
          const itemData = item.stop_name
            ? item.stop_name.toUpperCase()
            : ''.toUpperCase();
          const textData = text.toUpperCase();
          return itemData.indexOf(textData) > -1;
        }
      });
      setFilteredDataSource(newData);
      setSearch(text);
    } else {
      setFilteredDataSource([]);
      setSearch(text);
    }
  };

  const ItemView = ({ item }) => {
    return (
      <Text style={styles.itemStyle} onPress={() => {
        setStopData(item);
        setFilteredDataSource([]);
        setSearch('');
        setUpdate(!update);
      }}>
        <Text style={{ fontWeight: '600' }}> {item.stop_code} </Text>
        {' | '}
        {item.stop_name}
      </Text>
    );
  };

  const ItemSeparatorView = () => {
    return (
      <View
        style={{
          height: 0.5,
          width: '100%',
          backgroundColor: '#C8C8C8',
        }}
      />
    );
  };

  return (
    <View>
      <View style={styles.container}>
        <SearchBar
          round
          lightTheme
          searchIcon={{ size: 24 }}
          onChangeText={(text) => searchFilterFunction(text)}
          onClear={(text) => searchFilterFunction('')}
          placeholder="Search by stop number or name..."
          value={search}
        />
        {search &&
          <FlatList
            style={styles.flatList}
            data={filteredDataSource}
            keyExtractor={(item, index) => index.toString()}
            ItemSeparatorComponent={ItemSeparatorView}
            renderItem={ItemView}
          />
        }

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  itemStyle: {
    padding: 10,
  },
});


export default SearchBarComponent;
