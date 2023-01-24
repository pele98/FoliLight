import { StyleSheet } from 'react-native';
import { UserProvider } from './context/UserContext';
import { NavigationContainer } from '@react-navigation/native';
import Navigator from './views/Navigator';
import getEnvVars from './config';

const { API_URI } = getEnvVars();

const uri = API_URI;


export default function App() {
  return (
    <UserProvider>
      <NavigationContainer styles={styles.root}>
        <Navigator />
      </NavigationContainer>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
