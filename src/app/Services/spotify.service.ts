import { Injectable } from '@angular/core';

declare var Spotify: any; // Declare Spotify object globally

@Injectable({
  providedIn: 'root',
})
export class SpotifyService {
  private player: any;
  private isPlayerReady: boolean = false;
  private deviceId: string = '';

  private readonly clientId = '9e299651fa6543618205a7bbeb29e944'; // Replace with your client ID
  private readonly clientSecret = '6c1a9aac7c244315969b9467ec81d526'; // Replace with your client secret
  private accessToken: string =
    localStorage.getItem('spotify_access_token') || '';

  // Get the OAuth token using client credentials flow
  async getToken(): Promise<void> {
    try {
      // 1️⃣ Get Access Token
      const tokenResponse = await fetch(
        'https://accounts.spotify.com/api/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: this.clientId,
            client_secret: this.clientSecret,
          }),
        }
      );

      if (!tokenResponse.ok) {
        console.error(
          'Failed to get access token',
          tokenResponse.status,
          tokenResponse.statusText
        );
        throw new Error('Failed to retrieve access token');
      }

      const tokenData = await tokenResponse.json();

      if (tokenData.access_token) {
        this.accessToken = tokenData.access_token;
        console.log('Access token received');
      } else {
        console.error('No access token found');
        throw new Error('No access token found');
      }
    } catch (error) {
      console.error('Error fetching token:', error);
    }
  }

  // Initialize the Spotify Player with OAuth token
  async initializeSpotifyPlayer(songAndToken: any): Promise<void> {
    console.log('this.initializeSpotifyPlayer called ');
    this.accessToken = songAndToken.accessToken;
    console.log('jbours access token ', this.accessToken);
    try {
      if (!this.accessToken) {
        await this.getToken();
      }
      // console.log('access token  ', this.accessToken);

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
          this.playSong(songAndToken.song.id);
        });

        // When the player state changes (e.g., when a track changes)
        this.player.on('player_state_changed', (state: any) => {
          if (!state) {
            console.error('Player state is null');
            return;
          }

          console.log(
            'Currently playing track:',
            state.track_window.current_track.name
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

  // Play a song using a track ID
  playSong(trackId: string): void {
    if (this.isPlayerReady) {
      const trackUri = `spotify:track:${trackId}`;
      this.player
        .resume({
          uris: [trackUri],
        })
        .then(() => {
          console.log('Now playing track: ', trackId);
        })
        .catch((e: any) => {
          console.error('Error playing track:', e);
        });
    } else {
      console.error('Player is not ready yet.');
    }
  }

  // Optionally: Stop playing music
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

  // Get OAuth token from URL hash (for client-side authentication)
  getAccessTokenFromUrl(): void {
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    this.accessToken = urlParams.get('access_token')!;
  }
}
