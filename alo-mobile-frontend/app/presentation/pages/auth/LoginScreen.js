import { Button, Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { GlobalStyles } from "../../styles/GlobalStyles"

export const LoginScreen = ({navigation}) => {
    return (
        <SafeAreaView style={GlobalStyles.container}>
            <Text>Login Screen</Text>
            <Button title="Go to Register" onPress={() => navigation.navigate('register')} />
            <Button title="App" onPress={() => navigation.navigate('inapp')} />
        </SafeAreaView>
    )
}