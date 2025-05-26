import { Component, OnDestroy, OnInit } from '@angular/core';
import { SongPlayService } from '../../Services/song-play.service';
import { SpotifyService } from '../../Services/spotify.service';
import { ButtonComponent } from '../button/button.component';
import { LibraryService } from '../../Services/API/library.service';
import { BehaviorSubject, Observable, Subscription, take } from 'rxjs';
import { AccountService } from '../../Services/API/account.service';
import { DecimalPipe, NgIf } from '@angular/common';
import { SweetAlertService } from '../../Services/sweet-alert.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-song-play-card',
  standalone: true,
  imports: [NgIf, TranslateModule],
  templateUrl: './song-play-card.component.html',
  styleUrl: './song-play-card.component.css',
})
export class SongPlayCardComponent implements OnInit, OnDestroy {
  private songSubscription$!: Subscription;
  isLoggedIn: boolean = false;
  trackProgress: number = 0;
  trackDuration: number = 0;
  accessToken: string = '';

  // Initial value to prevent undefined errors
  selectedSong: any = { isSelected: false };

  volume: number = 0.5;

  isSongPlaying: boolean = false;

  constructor(
    private readonly songPlayService: SongPlayService,
    private readonly spotifyService: SpotifyService,
    private readonly libraryService: LibraryService,
    private readonly accountService: AccountService,
    private readonly sweetAlertService: SweetAlertService
  ) {}

  ngOnDestroy(): void {
    if (this.songSubscription$) {
      this.songSubscription$.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.spotifyService.trackProgress$.subscribe((progress) => {
      this.trackProgress = progress;
    });

    this.spotifyService.trackDuration$.subscribe((duration) => {
      this.trackDuration = duration;
    });

    this.accountService.isUserLoggedIn().subscribe({
      next: (response: boolean) => {
        this.isLoggedIn = response;
        if (this.isLoggedIn) {
          this.songSubscription();
        }
      },
    });
  }

  playPauseSong() {
    if (this.isSongPlaying) {
      this.spotifyService.stopSong();
    } else {
      this.spotifyService.resumePlayback();
    }

    this.isSongPlaying = !this.isSongPlaying;
  }

  songSubscription() {
    this.songSubscription$ = this.songPlayService.songSubject$.subscribe({
      next: (response) => {
        if (response) {
          this.selectedSong = response;
          console.log('model in play card  ', response);
          this.isSongPlaying = true;

          console.log('songggggg ', this.selectedSong);

          let user: any = localStorage.getItem('user');

          user = JSON.parse(user);

          let spotify: any = user.spotify;

          if (!spotify) {
            this.sweetAlertService.error('Please link your account to Spotify');
            return;
          }

          if (!document.body.classList.contains('song-play-shown')) {
            document.body.classList.add('song-play-shown');
          }

          console.log('spotifyyyyyyyyyyyyy', spotify);
          console.log(user);

          if (Date.now() > new Date(spotify.tokenExpiresAt).getTime()) {
            let refreshToken = spotify.refreshToken;

            this.accountService.refreshSpotifyToken(refreshToken).subscribe({
              next: (response: any) => {
                let user = response.data.user;
                localStorage.setItem('user', JSON.stringify(user));
                this.accessToken = response.data.user.spotify.accessToken;
                this.handleSpotifyPlay(this.selectedSong, this.accessToken);
              },
            });
          } else {
            this.accessToken = spotify.accessToken;
            this.handleSpotifyPlay(this.selectedSong, this.accessToken);
          }
        }
      },
    });
  }

  handleSpotifyPlay(selectedSong: any, accessToken: string) {
    this.spotifyService.handleSpotifyPlay(selectedSong, accessToken);
  }

  handleAddRemoveToFromLibrary() {
    if (this.selectedSong.isSelected) {
      this.removeItemFromLibrary();
    } else {
      this.addItemToLibrary();
    }
  }

  addItemToLibrary() {
    this.selectedSong.isSelected = true;
    console.log('selected song', this.selectedSong);

    let model = {
      itemId: this.selectedSong.uri,
      itemType: 'song',
      title: this.selectedSong.name,
      artistOrDirector: this.selectedSong.artists.toString(),
      itemImage: this.selectedSong.images?.[0]?.url,
    };

    this.libraryService.addItemToLibrary(model).subscribe({
      next: (response: any) => {
        console.log(response);
        this.libraryService.updateaddedRemovedSongFromLibraryTrigger(true);
      },
    });
  }

  removeItemFromLibrary() {
    this.selectedSong.isSelected = false;

    this.libraryService.removeItemFromLibrary(this.selectedSong.uri).subscribe({
      next: (response: any) => {
        console.log(response);
        this.libraryService.updateaddedRemovedSongFromLibraryTrigger(true);
      },
    });
  }

  playNext() {
    this.selectedSong = this.spotifyService.nextTrack();
    this.isSongPlaying = true;
  }

  playPrev() {
    this.selectedSong = this.spotifyService.prevTrack();
    this.isSongPlaying = true;
  }

  closeCard() {
    document.body.classList.remove('song-play-shown');
    this.spotifyService.stopSong();
    this.isSongPlaying = true;
  }

  onSeek(event: any): void {
    const seekPosition = event.target.value;
    if (this.spotifyService.player && this.spotifyService.isPlayerReady) {
      this.spotifyService.player.seek(seekPosition).then(() => {
        this.trackProgress = seekPosition;
      });
    }
  }

  formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  }

  onVolumeChange(event: Event): void {
    const value = (event.target as HTMLInputElement).valueAsNumber;
    this.volume = value;
    this.spotifyService.setVolume(value);
  }
}
