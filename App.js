import { StyleSheet } from 'react-native';
import { UserProvider } from './context/UserContext';
import { NavigationContainer } from '@react-navigation/native';
import Navigator from './views/Navigator';

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
