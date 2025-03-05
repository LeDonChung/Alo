import { Button, Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export const RegisterScreen = ({navigation}) => {
    return (
        <SafeAreaView>
            <Text>Register Screen</Text>
            <Button title="Go to Login" onPress={() => navigation.navigate('login')} />
        </SafeAreaView>
    )
}