import {Component, Inject, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-bpmn-development',
  templateUrl: './bpmn-development.component.html',
  styleUrls: ['./bpmn-development.component.css']
})
export class BPMNDevelopmentComponent implements OnInit {
  url: string;

  constructor(
    private router: Router
  ) {
  }

  ngOnInit() {
    // this.router.events.subscribe((event) => {
    //   if (event.__proto__.constructor.name === 'NavigationStart') {
    //     console.log(event.url);
    //     this.url = event.url;
    //   }
    // });
  }
}
