import React from "react"
import { View, Text } from "react-native"
import { Ionicons } from '@expo/vector-icons';
import MusicListView from "../containers/MusicListView"
import styles from "./styles"
import { colors } from "../ui/colors"
import * as Font from "expo-font"
export default class MusicListScreen extends React.PureComponent {
  async componentDidMount() {
   
    this.props.navigation.setOptions({
      title: "Home",
      headerTintColor: colors.secondary_dark,
      headerTitleStyle: {
        fontFamily: "PTSans"
      }
    })
  
  }
  render() {
    return (
      <View>
        <MusicListView />
      </View>
    )
  }
}
