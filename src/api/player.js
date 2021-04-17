
import { observable, action } from 'mobx';
import { ReactNativeAudioStreaming } from 'react-native-audio-streaming';
import axios from 'axios';
import { CLIENT_ID, PLAYER_MODE } from './config';
import {  AsyncStorage ,DeviceEventEmitter } from 'react-native';

class Player {
   song = {};
   playlist = [];
     progress = 0;
   mode = PLAYER_MODE[0];
  playing = false;
  paused = false;

    history = [];

    async stop() {
        self.paused = false;
        self.playing = false;
        self.progress = 0;
        ReactNativeAudioStreaming.pause();
    }

 toggle() {
        if (self.paused) {
            ReactNativeAudioStreaming.resume();
        } else {
            ReactNativeAudioStreaming.pause();
        }

        self.paused = !self.paused;
    }

updatePlaylist(playlist) {
        self.playlist.clear();
        self.playlist.push(...playlist.slice());
    }

   async start({ song, playlist = self.playlist, needTrack = true }) {
        var prev = self.song;

        /** Keep playlist always reaction */
        self.song = song;

        if (prev.id === song.id
            && self.playlist.uuid === playlist.uuid) {
            if (self.paused) {
                self.toggle();
            }

            if (self.playing) {
                return;
            }
        }

        if (prev.id !== song.id) {
            self.stop();
        }

        if (self.playlist.uuid !== playlist.uuid) {
            self.history = [];
            self.playlist.clear();
            self.playlist.uuid = playlist.uuid;
            self.playlist.push(...playlist.slice());
        } else if (self.playlist.length !== playlist.length) {
            self.playlist.clear();
            self.playlist.push(...playlist.slice());
        }

        needTrack && self.history.push(song);

        self.paused = false;

        var response = axios.get(song.uri + '/streams', {
            params: {
                client_id: CLIENT_ID,
            }
        }).catch(ex => {
            self.next();
        });
        var streamurl = (await response).data.http_mp3_128_url;

        ReactNativeAudioStreaming.play(streamurl, { showIniOSMediaCenter: true });
    }

     async changeMode() {
        var index = PLAYER_MODE.indexOf(self.mode);

        if (index === -1 || index === PLAYER_MODE.length - 1) {
            self.mode = PLAYER_MODE[0];
        } else {
            self.mode = PLAYER_MODE[++index];
        }

        await AsyncStorage.setItem('@Player:mode', self.mode);
    }

    next() {
        var playlist = self.playlist;
        var index = playlist.findIndex(e => e.id === self.song.id);
        var song;

        if (self.mode === PLAYER_MODE[0]) {
            if (index === playlist.length - 1) {
                song = playlist[0];
            } else {
                song = playlist[index + 1];
            }
        } else {
            var shuffle = new Array(playlist.length - 1);

            shuffle = shuffle.fill(0).map((e, i) => {
                return i < index ? i : ++i;
            });

            song = playlist[Math.floor(Math.random() * shuffle.length)];
        }

        self.stop();
        self.start({ song });
    }

    prev() {
        var song = self.history[self.history.length - 2];

        if (!song) {
            song = self.history[0];
        } else {
            self.history.pop();
        }

        self.stop();
        self.start({ song, needTrack: false });
    }

   async init() {
        var mode = await AsyncStorage.getItem('@Player:mode');

        if (PLAYER_MODE.includes(mode)) {
            self.mode = mode;
        }

        DeviceEventEmitter.addListener('AudioBridgeEvent', e => {
            var { status, duration, progress } = e;

            if (status === 'ERROR') {
                throw e;
            }

            self.playing = ['PLAYING', 'BUFFERING', 'PAUSED', 'STREAMING'].includes(status);

            if (['BUFFERING', 'STOPPED'].includes(status)) {
                self.progress = 0;
            }

            if (status === 'STOPPED' && self.playing === false) {
                return self.next();
            }

            if (status === 'STREAMING') {
                return (self.progress = progress / duration);
            }
        });
    }
}

const self = new Player();
export default self;
