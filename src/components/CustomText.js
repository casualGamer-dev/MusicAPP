import React from "react"
import { View, Text } from "react-native"
import * as Font from "expo-font"
import { Ionicons } from '@expo/vector-icons';
import ExpoMusicApp from "../ExpoMusicApp"
const CustomText = props => {
  
  const font_name = props.style.fontWeight ? "PTSans-Bold" : "PTSans"
  return (
    <Text
      {...props}
      style={[props.style, {  fontFamily: font_name,fontWeight: "normal" }]}>
      {props.children}
    </Text>
  )
}
export default CustomText