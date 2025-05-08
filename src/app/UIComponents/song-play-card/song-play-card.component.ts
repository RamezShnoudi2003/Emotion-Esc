import { Component, OnDestroy, OnInit } from '@angular/core';
import { SongPlayService } from '../../Services/song-play.service';
import { SpotifyService } from '../../Services/spotify.service';
import { ButtonComponent } from '../button/button.component';
import { LibraryService } from '../../Services/API/library.service';
import { BehaviorSubject, Observable, Subscription, take } from 'rxjs';
import { AccountService } from '../../Services/API/account.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-song-play-card',
  standalone: true,
  imports: [NgIf],
  templateUrl: './song-play-card.component.html',
  styleUrl: './song-play-card.component.css',
})
export class SongPlayCardComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  private songSubscription$!: Subscription;

  // Initial value to prevent undefined errors
  selectedSong: any = { isSelected: false };

  addedToFavorites: boolean = false;
  constructor(
    private readonly songPlayService: SongPlayService,
    private readonly spotifyService: SpotifyService,
    private readonly libraryService: LibraryService,
    private readonly accountService: AccountService
  ) {}

  ngOnDestroy(): void {
    if (this.songSubscription$) {
      this.songSubscription$.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.accountService.isUserLoggedIn().subscribe({
      next: (response: boolean) => {
        this.isLoggedIn = response;
        if (this.isLoggedIn) {
          this.songSubscription();
        }
      },
    });
  }

  songSubscription() {
    this.songSubscription$ = this.songPlayService.songSubject$.subscribe({
      next: (response) => {
        if (response) {
          this.selectedSong = response;
          console.log('model in play card  ', response);
          // console.log('songggggg ', response);
          // let token = this.selectedSong.accessToken;
          // this.spotifyService.initializeSpotifyPlayer(this.selectedSong);
          // this.spotifyService.playSong(this.selectedSong.song.id);
        }
      },
    });
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
      },
    });
  }

  removeItemFromLibrary() {
    this.selectedSong.isSelected = false;

    this.libraryService.removeItemFromLibrary(this.selectedSong.uri).subscribe({
      next: (response: any) => {
        console.log(response);
      },
    });
  }

  closeCard() {
    document.body.classList.remove('song-play-shown');
  }
}
