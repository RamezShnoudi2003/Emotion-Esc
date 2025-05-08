import { Component, OnInit } from '@angular/core';
import { SongBoxComponent } from '../../UIComponents/song-box/song-box.component';
import { NgFor, NgIf } from '@angular/common';
import { PersistDataService } from '../../Services/persist-data.service';
import { SongPlayCardComponent } from '../../UIComponents/song-play-card/song-play-card.component';
import { SongPlayService } from '../../Services/song-play.service';
import { SongsService } from '../../Services/API/songs.service';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../UIComponents/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../Services/language.service';
import { LibraryService } from '../../Services/API/library.service';

@Component({
  selector: 'app-songs',
  standalone: true,
  imports: [SongBoxComponent, NgFor, NgIf, TranslateModule],

  templateUrl: './songs.component.html',
  styleUrls: ['./songs.component.css'],
})
export class SongsComponent implements OnInit {
  // token: string = '';

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
    private readonly libraryService: LibraryService
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

  // showAll(type: string) {
  //   // we set 'all-emotion' even tho
  //   //  we already have 'emotion' saved in persistDataService
  //   // because we remove all-emotion when leaving show-all screen
  //   // but we wanna keep emotion
  //   this.persistDataService.setItem('all-emotion', this.emotion);
  //   this.router.navigate(['show-all'], { queryParams: { type } });
  // }

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

        // this.token = response.data.accessToken;
        this.isSongsLoading = false;
      },
      error: (serverError) => {
        this.isSongsLoading = false;
      },
    });
  }

  playSong(song: any) {
    // window.location.href = `https://open.spotify.com/track/${song.id}`;
    if (!document.body.classList.contains('song-play-shown')) {
      document.body.classList.add('song-play-shown');
    }

    // let model = {
    //   song: song,
    //   accessToken: this.token,
    // };
    // console.log('sent  model', model);
    // this.songPlayService.setSong(model);
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
