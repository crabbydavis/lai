import { AuthService } from './../core/services/auth.service';
import { SongService } from '../core/services/song.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  constructor(
    public songService: SongService,
  ) {
  }

  ngOnInit() {
  }
}
