import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

declare let Spotify: any;

@Injectable({
  providedIn: 'root',
})
export class SpotifyService {
  public player: any;
  public isPlayerReady: boolean = false;
  private accessToken: string = '';
  private deviceId: string = '';
  progressInterval: any;

  public trackList: any[] = [];
  currentTrackIndex: number = 0;

  public trackProgress$: BehaviorSubject<number> = new BehaviorSubject(0);
  public trackDuration$: BehaviorSubject<number> = new BehaviorSubject(0);

  private readonly isLinkedToSpotifySubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  isLinkedToSpotify$: Observable<boolean> =
    this.isLinkedToSpotifySubject.asObservable();

  handleSpotifyPlay(selectedSong: any, accessToken: string) {
    if (this.player && this.isPlayerReady) {
      console.log('Spotify Player already initialized.');
      this.playSong(selectedSong.uri);
    } else {
      this.initializeSpotifyPlayer(selectedSong, accessToken);
    }
  }

  // Initialize the Spotify Player with OAuth token
  initializeSpotifyPlayer(selectedSong: any, accessToken: string) {
    try {
      this.accessToken = accessToken;

      console.log('this.initializeSpotifyPlayer called ');

      if (this.accessToken) {
        // Create the player instance
        this.player = new Spotify.Player({
          name: 'My Spotify Web Playback',
          getOAuthToken: (cb: any) => {
            // Provide the access token to the Spotify player
            cb(this.accessToken);
          },
          volume: 0.5,
        });

        // Event listeners for various player states
        this.player.on('initialization_error', (e: any) => {
          console.error('Spotify Player initialization error:', e);
        });

        this.player.on('authentication_error', (e: any) => {
          console.error('Spotify Player authentication error:', e);
        });

        this.player.on('account_error', (e: any) => {
          console.error('Spotify Player account error:', e);
        });

        this.player.on('playback_error', (e: any) => {
          console.error('Spotify Player playback error:', e);
        });

        // When the player is ready to start
        this.player.on('ready', (data: any) => {
          console.log('Spotify Player is ready with device ID', data.device_id);
          this.deviceId = data.device_id;
          this.isPlayerReady = true;

          this.playSong(selectedSong.uri);
        });

        // When the player state changes (e.g., when a track changes)
        this.player.on('player_state_changed', (state: any) => {
          if (!state) {
            console.error('Player state is null');
            return;
          }

          console.log(
            'Currently playing track:',
            state.track_window.current_track?.name
          );
        });
        // Initialize the player
        this.player.connect().then((success: any) => {
          if (!success) {
            console.error('Failed to connect to the player');
          }
        });
      } else {
        console.error('No access token available, cannot initialize player');
      }
    } catch (error) {
      console.error('Error during Spotify Player initialization:', error);
    }
  }

  // Play a song using a track URI
  playSong(trackUri: string): void {
    clearInterval(this.progressInterval);
    if (this.isPlayerReady && this.accessToken && this.deviceId) {
      fetch(
        'https://api.spotify.com/v1/me/player/play?device_id=' + this.deviceId,
        {
          method: 'PUT',
          body: JSON.stringify({
            uris: [trackUri],
          }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to start playback');
          }

          this.trackList.forEach((item: any, index: number) => {
            if (item.uri === trackUri) {
              this.currentTrackIndex = index;
            }
          });

          console.log('Now playing track: ', trackUri);
          this.startProgressTracking();
        })
        .catch((e: any) => {
          console.error('Error playing track:', e);
        });
    } else {
      console.error('Player is not ready or access token/device ID missing.');
    }
  }

  startProgressTracking(): void {
    clearInterval(this.progressInterval);
    this.progressInterval = setInterval(() => {
      if (this.player && this.isPlayerReady) {
        this.player.getCurrentState().then((state: any) => {
          if (state) {
            this.trackProgress$.next(state.position);
            this.trackDuration$.next(state.duration);
          }
        });
      }
    }, 1000);
  }

  setVolume(volume: number): void {
    if (this.player && this.isPlayerReady) {
      this.player
        .setVolume(volume)
        .then(() => {
          console.log(`Volume set to ${volume}`);
        })
        .catch((e: any) => {
          console.error('Failed to set volume:', e);
        });
    } else {
      console.error('Player is not ready.');
    }
  }

  resumePlayback(): void {
    if (this.player && this.isPlayerReady) {
      this.player
        .resume()
        .then(() => {
          console.log('Playback resumed');
        })
        .catch((error: any) => {
          console.error('Error resuming playback:', error);
        });
    } else {
      console.error('Player is not ready.');
    }
  }

  stopSong(): void {
    if (this.isPlayerReady) {
      this.player
        .pause()
        .then(() => {
          console.log('Track paused');
        })
        .catch((e: any) => {
          console.error('Error pausing track:', e);
        });
    } else {
      console.error('Player is not ready yet.');
    }
  }

  playTrackByIndex(index: number): any {
    if (index >= 0 && index < this.trackList.length) {
      const track = this.trackList[index];
      this.currentTrackIndex = index;
      this.playSong(track.uri); // your existing method
      return track;
    } else {
      console.warn('Track index out of bounds');
    }
  }

  nextTrack(): any {
    const nextIndex = this.currentTrackIndex + 1;
    if (nextIndex < this.trackList.length) {
      let track = this.playTrackByIndex(nextIndex);
      console.log('trackkk', track);
      // track.isSelected = false;
      return track;
    } else {
      console.log('End of playlist');
      let track = this.playTrackByIndex(0);
      return track;
    }
  }

  prevTrack(): any {
    const prevIndex = this.currentTrackIndex - 1;
    if (prevIndex >= 0) {
      let track = this.playTrackByIndex(prevIndex);
      console.log('trackkk', track);
      // track.isSelected = false;
      return track;
    } else {
      console.log('Start of playlist');
      let track = this.playTrackByIndex(this.trackList.length - 1);
      return track;
    }
  }

  setIsLinkedToSpotify(value: boolean) {
    this.isLinkedToSpotifySubject.next(value);
  }
}
