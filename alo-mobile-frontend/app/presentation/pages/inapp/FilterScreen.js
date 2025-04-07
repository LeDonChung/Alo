import { Button, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { GlobalStyles } from "../../styles/GlobalStyles"

export const FilterScreen = ({navigation}) => {
    return (
        <View style={GlobalStyles.container}>
            <Text>Filter Screen</Text>
            <Button title="Go to Register" onPress={() => navigation.navigate('inapp')} />
        </View>
    )
}