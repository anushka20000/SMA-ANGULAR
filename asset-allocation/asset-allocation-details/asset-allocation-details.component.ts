import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, EventEmitter, Output, Renderer2 } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from 'src/app/modules/auth';
import { SchoolService } from 'src/app/services/schoolnet/school.service';
import {first} from "rxjs/operators";
import { UserType } from 'aws-sdk/clients/workdocs';
import {User} from "../../../modules/auth/models/AuthResponse";

@Component({
  selector: 'app-asset-allocation-details',
  templateUrl: './asset-allocation-details.component.html',
  styleUrls: ['./asset-allocation-details.component.scss']
})
export class AssetAllocationDetailsComponent {
  @Output() OnAddForm = new EventEmitter<any>();
  public activeTab:number=1;
  user$: Observable<UserType> | any;
  user:User | any;
  public changeTab(tabId: number) {
    this.activeTab = tabId;
    
  }
  public id: any = 0;
  public commonEntityName: string = 'School';
  public commonEntityNameAttribute: string = '';
  public commonEntityNameTable: string = '';
  public schoolData: any;
  public data: any;

  public isLoading: boolean;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  constructor(private cdr: ChangeDetectorRef, private http: HttpClient, private renderer: Renderer2,
    private changeDetector: ChangeDetectorRef, private route: ActivatedRoute,
    private router: Router, private toastr: ToastrService,
    //TODO change to your own service
    private apiService: SchoolService,
    private auth: AuthService,
) {

this.commonEntityNameAttribute= this.commonEntityName.toLowerCase().replace(/\s/g, '_').toLowerCase();
this.commonEntityNameTable= this.commonEntityNameAttribute+'_table';
//alert(this.commonEntityNameAttribute);
}
  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.id = params.get('id');
      if(this.id !=null)
      {
        if(this.id>0)
        {
          //this.showDrawer("live_chat_drawer");
          this.loadSchool();
        }
      }
    });
    this.user$ = this.auth.currentUserSubject.asObservable();
    this.user$.subscribe((user: any) => {
      if(user)
      {
        this.user = user;
        //console.log(user);
      }
      else
      {
        this.logout();
      }
    })
  }

  
  logout() {
    this.auth.logout();
  }
  loadSchool()
  {
  
    this.apiService.getValue(this.id)
      .pipe(first())
      .subscribe(
        data => {
          if (data) {
              this.schoolData = data.data;
              // console.log(this.schoolData);
              this.cdr.detectChanges();
          }
          else
          {
            this.toastr.error("Error :"+data.message+", Please try again after sometime.",
              'Service Engineers',{
                timeOut: 3000,
                progressBar:true,
                tapToDismiss:true,
                toastClass: 'flat-toast ngx-toastr'
              });
          }
        },
        error => {
          this.toastr.error("Error:"+error.toString()+", Please try again after sometime.",
            'Service Engineers',{
              timeOut: 3000,
              progressBar:true,
              tapToDismiss:true,
              toastClass: 'flat-toast ngx-toastr'
            });
        });
  }
}
