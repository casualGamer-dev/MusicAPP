import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import ExpoMusicApp from "../ExpoMusicApp"
import Search from '../api/SSearch';
import Listing from '../api/List';
import token from '../api/token';
import SSearch from '../api/SSearch';
import search from '../api/search';
const PAGE = 20;

export default class SearchScreen extends React.Component {
  constructor() {
    super();

    this.state = {
      songs: [],
      offset: 0,
      query: 'Shpongle',
      isFetching: false,
      token: null,
      isTokenFetching: false,
    };
  }

  async loadNextPage() {
    const { songs, offset, query, token, isFetching } = this.state;

    if (isFetching) {
      return;
    }

    this.setState({ isFetching: true });

    const newSongs = await search({
      offset: offset,
      limit: PAGE,
      q: query,
      token,
    });

    if (newSongs.length === 0) {
      console.log('no songs found. there may be an error');
    }

    this.setState({
      isFetching: false,
      songs: [...songs, ...newSongs],
      offset: offset + PAGE,
    });
  }

  async refreshToken() {
    this.setState({
      isTokenFetching: true,
    });

    const newToken = await token();

    this.setState({
      token: newToken,
      isTokenFetching: false,
    });
  }

  async componentDidMount() {
    await this.refreshToken();
    await this.loadNextPage();
  }

  handleSearchChange(text) {
    // reset state
    this.setState({
      query: text,
      offset: 0,
      songs: [],
    }, () => {
      this.loadNextPage();
    });
    console.log('search text is', text);
  }

  async handleEndReached() {
    await this.loadNextPage();
  }

  render() {
    const { songs, query, isFetching } = this.state;

    return (
      <View style={styles.container}>
        <TouchableOpacity>
        <SSearch
        onChange={text => this.handleSearchChange(text)}
        text={query}
        />
        {
        (isFetching && songs.length === 0)
        ? <ActivityIndicator />
        : <Listing
        items={songs}
        onEndReached={() => this.handleEndReached()}
        />
        }
        </TouchableOpacity>
      </View>
  );
}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    margin: 10,
    marginTop: 50,
  },
});
