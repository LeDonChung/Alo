import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { AppNavigation } from './app/presentation/nativagtions/AppNavigation';
import Toast from 'react-native-toast-message';

export default function App() {
  return (
    <>
      <AppNavigation />
      <Toast />
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
