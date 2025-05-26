import { Component, OnInit } from '@angular/core';
import { SongBoxComponent } from '../../UIComponents/song-box/song-box.component';
import { NgFor, NgIf } from '@angular/common';
import { PersistDataService } from '../../Services/persist-data.service';
import { SongPlayService } from '../../Services/song-play.service';
import { SongsService } from '../../Services/API/songs.service';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../Services/language.service';
import { LibraryService } from '../../Services/API/library.service';
import { SpotifyService } from '../../Services/spotify.service';

@Component({
  selector: 'app-songs',
  standalone: true,
  imports: [SongBoxComponent, NgFor, NgIf, TranslateModule],

  templateUrl: './songs.component.html',
  styleUrls: ['./songs.component.css'],
})
export class SongsComponent implements OnInit {
  isSongsLoading: boolean = false;
  emotion: string = '';
  tracks: any[] = [];
  count: number = 1;
  lang: string = 'ar';

  constructor(
    private readonly persistDataService: PersistDataService,
    private readonly songPlayService: SongPlayService,
    private readonly songsService: SongsService,
    private readonly router: Router,
    private readonly languageService: LanguageService,
    private readonly libraryService: LibraryService,
    private readonly spotifyService: SpotifyService
  ) {
    this.languageService.language$.subscribe({
      next: (response: string) => {
        this.lang = response;
      },
    });
  }

  ngOnInit(): void {
    let emotion = '';

    this.persistDataService.emotion$.subscribe({
      next: (response: string) => {
        emotion = response;
      },
    });

    if (emotion) {
      this.emotion = emotion;
    }
    this.getMusicRecommendations(this.count);
  }

  getMusicRecommendations(page: number) {
    this.isSongsLoading = true;

    this.tracks = [];

    let model = {
      emotion: this.emotion || '',
      page: page,
    };

    this.songsService.getMusicRecommendations(model).subscribe({
      next: (response: any) => {
        console.log('get music recommendations ', response);
        this.tracks = response.data.tracks;
        this.spotifyService.trackList = this.tracks;

        let model = {
          type: 'song',
          search: '',
        };

        let ids: any[] = [];

        this.libraryService.getLibrary(model).subscribe({
          next: (libraryResponse: any) => {
            if (libraryResponse) {
              console.log(libraryResponse);

              libraryResponse.data.items.forEach((item: any) => {
                ids.push(item.itemId);
              });

              this.tracks.forEach((item: any) => {
                if (item && item.uri) {
                  // Mark as selected if uri matches id in library
                  item.isSelected = ids.includes(item.uri);
                }
              });

              console.log(this.tracks);
            }
          },
        });

        this.isSongsLoading = false;
      },
      error: (serverError) => {
        this.isSongsLoading = false;
      },
    });
  }

  playSong(song: any) {
    this.songPlayService.setSong(song);
  }

  next() {
    this.count += 1;
    this.getMusicRecommendations(this.count);
  }

  prev() {
    if (this.count > 1) {
      this.count -= 1;
      this.getMusicRecommendations(this.count);
    }
  }

  letsEsc() {
    this.router.navigateByUrl('lets-escape');
  }
}
