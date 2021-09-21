import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Observable,Subscription, interval  } from 'rxjs';
import { LeaderboardService } from 'src/app/services/leaderboard.service';
import { MainService } from 'src/app/services/main.service';
import { SubscribeService } from 'src/app/services/subscribe.service';

export interface PlayerData {
  name: string;
  rank: number;
  scores: number;
  kills: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  playlist={'current':'','next':''}
  teamData:any;
  topPlayers:PlayerData[]=[];

  columns = [
    {
      columnDef: 'rank',
      header: 'No.',
      cell: (element:  PlayerData) => `${element.rank}`
    },
    {
      columnDef: 'name',
      header: 'Name',
      cell: (element:  PlayerData) => `${element.name}`
    },
    {
      columnDef: 'scores',
      header: 'Score',
      cell: (element:  PlayerData) => `${element.scores}`
    },
    {
      columnDef: 'kills',
      header: 'Kills',
      cell: (element:  PlayerData) => `${element.kills}`
    }
  ];
  dataSource =new MatTableDataSource<PlayerData>();

  displayedColumns = this.columns.map(c => c.columnDef);

  constructor(private mainservice:MainService,public dialog: MatDialog,private subService:SubscribeService,private lBoard:LeaderboardService,private changeDetectorRefs: ChangeDetectorRef) { }
  private updateSubscription: Subscription;

  ngOnInit() {
    this.getLeaderboard();
    this.lBoard.leaderboardUpdateEvent.subscribe(x=>{
      this.getLeaderboard();
      this.changeDetectorRefs.detectChanges();
    })
    this.refreshData();
    this.updateSubscription = interval(9000).subscribe(
            (val) => { this.refreshData()});

    }

  getLeaderboard(){
    this.topPlayers= this.lBoard.getLeaderboard().slice(0,5);
    this.dataSource.data=this.topPlayers;
  }
  openDialog(profile:any) {
      const dialogRef = this.dialog.open(ProfileDialog,{
        data:profile
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log(`Dialog result: ${result}`);
        if(result){
          this.subService.subscribeToNotifications(result.account_id,result.name);
        }

      });
    }

  refreshData(){
    this.mainservice.getLiveStats().subscribe(data=>{
      this.playlist=data.playlist;
      this.teamData=data.teamInfo;
    })
  }

}


@Component({
  selector: 'profile.dialog',
  templateUrl: './profile.dialog.html',
})
export class ProfileDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data:any){

  }
}
