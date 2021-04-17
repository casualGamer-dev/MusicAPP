import { Provider } from "react-redux"
import React from "react"
import * as Font from "expo-font"
import ExpoMusicApp from "./src/ExpoMusicApp"
import store from "./src/redux/store"

export default class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <ExpoMusicApp />
      </Provider>
    )
  }
}

