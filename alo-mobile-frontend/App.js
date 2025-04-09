import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { AppNavigation } from './app/presentation/nativagtions/AppNavigation';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import { store } from './app/presentation/redux/store';

export default function App() {
  return (
    <>
      <Provider store={store}>
        <AppNavigation />
        <Toast />
      </Provider>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
