import {ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output, Renderer2} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/modules/auth';
import {first} from "rxjs/operators";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import { AssetAllocationService } from 'src/app/services/schoolnet/asset-allocation.service';
import {BehaviorSubject, Subscription} from "rxjs";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
@Component({
  selector: 'app-new-asset-details',
  templateUrl: './new-asset.component.html',
  styleUrls: ['./new-asset.component.scss'],
  
})

export class NewAssetComponent {
  @Output() OnAddForm = new EventEmitter<any>();
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading: boolean;
  addForm: FormGroup;
  public activeTab:number=1;
 
  public changeTab(tabId: number) {
    this.activeTab = tabId;
    
  }
  public assetList:any
  public assetTypeList:any
  public assetId: any = 0;
  private unsubscribe: Subscription[] = [];
  public id: number;
  public commonEntityName: string = 'School';
  public commonEntityNameAttribute: string = '';
  public commonEntityNameTable: string = '';
  public schoolData: any;
  public schoolName: any;
  public schoolId: any;
  public assetTypeId: any;
  public obj: any;
  public entityName: string = "new-asset";
  constructor(private cdr: ChangeDetectorRef, private router:Router,private fb: FormBuilder,
    private toastr:ToastrService,
    private auth: AuthService,
    private route: ActivatedRoute,

    //TODO Change this service name
    private apiService:AssetAllocationService) {
const loadingSubscr = this.isLoading$
.asObservable()
.subscribe((res) => (this.isLoading = res));
this.unsubscribe.push(loadingSubscr);
this.onInsertInit();


}

onInsertInit()
{
  // TODO modify the array as per the form fields and validation
  this.addForm = this.fb.group({
    asset_id: ['', Validators.required],
    electrification: ['', Validators.required],
    date: ['', Validators.required],
    asset_type_id: ['', Validators.required],
    warrenty: [null]
  });
}
  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
       this.schoolId = params.get('id')
       console.log(this.schoolId)
       if(this.schoolId > 0){
        
        this.loadAssetType()
        this.fetchSchoolName(this.schoolId)
       }
    });
    
  }
  onInsert(objValue:any){
    // return false;
    objValue = {
      school_id: this.schoolId,
      id: this.assetId
    }
    // TODO add extra validation or calculation before insert if any
    this.apiService.save(objValue)
        .pipe(first())
        .subscribe(
            data => {
              // console.log(data);
              if (data && data.success==true) {
                this.addForm.reset();


                this.toastr.success(this.entityName+' added successfully', 'Add '+this.entityName,{
                  timeOut: 3000,
                  progressBar:true,
                  tapToDismiss:true,
                  toastClass: 'flat-toast ngx-toastr'
                });
                this.OnAddForm.emit(data);
                this.router.navigate(['/schools'])
                this.isLoading$.next(false);
                this.cdr.detectChanges();
              }
              else
              {
                this.toastr.error("Error Adding "+this.entityName+":"+data.message+ " Please try again after sometime.",
                    'Add '+this.entityName,{
                      timeOut: 3000,
                      progressBar:true,
                      tapToDismiss:true,
                      toastClass: 'flat-toast ngx-toastr'
                    });
              }
            },
            error => {
              if(error.status == 401){
                this.logout();
              }

              this.toastr.error("Error:"+error.toString()+ " Please try again after sometime.",
                  'Add '+this.entityName,{
                    timeOut: 3000,
                    progressBar:true,
                    tapToDismiss:true,
                    toastClass: 'flat-toast ngx-toastr'
                  });
            });
  }
 
  logout() {
    this.auth.logout();
  }
  loadAssets()
  {
    
    this.obj = {
      school_id : this.schoolId, 
      asset_type_id: this.assetTypeId
    }
    this.apiService.getAsset(this.obj)
      .pipe(first())
      .subscribe(
        data => {
          if (data) {
              this.assetList = data.data;
              console.log(this.assetList);
              this.cdr.detectChanges();
          }
          else
          {
            this.toastr.error("Error :"+data.message+", Please try again after sometime.",
              'assets',{
                timeOut: 3000,
                progressBar:true,
                tapToDismiss:true,
                toastClass: 'flat-toast ngx-toastr'
              });
          }
        },
        error => {
          this.toastr.error("Error:"+error.toString()+", Please try again after sometime.",
            'assets',{
              timeOut: 3000,
              progressBar:true,
              tapToDismiss:true,
              toastClass: 'flat-toast ngx-toastr'
            });
        });
  }
  loadAssetType()
  {
    this.assetId = null;
    const obj:any={}
    this.apiService.getAssetType(obj)
      .pipe(first())
      .subscribe(
        data => {
          if (data) {
              this.assetTypeList = data.data;
              console.log(this.assetTypeList);
              this.cdr.detectChanges();
              // this.loadAssets()
          }
          else
          {
            this.toastr.error("Error :"+data.message+", Please try again after sometime.",
              'asset types',{
                timeOut: 3000,
                progressBar:true,
                tapToDismiss:true,
                toastClass: 'flat-toast ngx-toastr'
              });
          }
        },
        error => {
          this.toastr.error("Error:"+error.toString()+", Please try again after sometime.",
            'asset types',{
              timeOut: 3000,
              progressBar:true,
              tapToDismiss:true,
              toastClass: 'flat-toast ngx-toastr'
            });
        });
  }
  fetchSchoolName(id: any){
    this.apiService.getName(this.schoolId)
      .pipe(first())
      .subscribe(
        data => {
          if (data) {
              this.schoolName = data.data.name;
              console.log(this.schoolName);
              this.cdr.detectChanges();
          }
          else
          {
            this.toastr.error("Error :"+data.message+", Please try again after sometime.",
              'school name',{
                timeOut: 3000,
                progressBar:true,
                tapToDismiss:true,
                toastClass: 'flat-toast ngx-toastr'
              });
          }
        },
        error => {
          this.toastr.error("Error:"+error.toString()+", Please try again after sometime.",
            'school name',{
              timeOut: 3000,
              progressBar:true,
              tapToDismiss:true,
              toastClass: 'flat-toast ngx-toastr'
            });
        });

  }
}
