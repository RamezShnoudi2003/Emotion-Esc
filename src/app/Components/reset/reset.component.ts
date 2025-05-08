import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';

@Component({
  selector: 'app-reset',
  imports: [],
  templateUrl: './reset.component.html',
  styleUrl: './reset.component.css',
})
export class ResetComponent implements OnInit {
  token: any;
  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const encodedToken = params?.get('token') || '';
      this.token = decodeURIComponent(encodedToken);
      localStorage.setItem(
        'returned resett token ',
        JSON.stringify(this.token)
      );
      console.log('Decoded token:', this.token);
    });
  }
}
