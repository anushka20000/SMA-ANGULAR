import {ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {BehaviorSubject,of, Subscription} from "rxjs";
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {AuthService} from "../../../modules/auth";
import {catchError, first} from "rxjs/operators";
import { AssetsService } from 'src/app/services/schoolnet/assets.service';
import {map} from "rxjs/operators";
@Component({
  selector: 'app-add-asset',
  templateUrl: './add-asset.component.html',
  styleUrls: ['./add-asset.component.scss']
})
export class AddAssetComponent implements OnInit, OnDestroy {
  @Output() OnAddForm = new EventEmitter<any>();
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading: boolean;
  addForm: FormGroup;
  public assetList:any = null;
  public assetCtegoryList: any = null;
  public projectType:any;
  public categoryId:any;
  public asset_type_id:any;
  private unsubscribe: Subscription[] = [];
  //TODO Change this entity name
  public entityName: string = "Individual Asset";

  public showSchoolName:number=0;
  constructor(private cdr: ChangeDetectorRef, private router:Router,private fb: FormBuilder,
              private toastr:ToastrService,
              private auth: AuthService,
              //TODO Change this service name
              private apiService:AssetsService) {
    const loadingSubscr = this.isLoading$
        .asObservable()
        .subscribe((res) => (this.isLoading = res));
    this.unsubscribe.push(loadingSubscr);
    this.onInsertInit();


  }

  ngOnInit(): void {
    // TODO call any service to fetch additional form data
this.loadCategories()
  }

  onInsertInit()
  {
    // TODO modify the array as per the form fields and validation
    this.addForm = this.fb.group({
      
        model: ['', Validators.required],
        serial_no: ['', Validators.required, [this.serialnoUniquenessValidator.bind(this)]],
        asset_type_id: ['', Validators.required],
        project: ['', Validators.required],
        asset_category_id: ['', Validators.required]

    });
  }
  serialnoUniquenessValidator(control: AbstractControl) {
    // console.log(control.value)
    if(control.value!="" && control.value!=null){
    return this.apiService.checkSerialNoUniqueness({serial_no: control.value}).pipe(
      map( (res: any) =>
       (res && res.success===true ? null : { serialNoExists: true })
       ),
      catchError(err => {
        if(err.status===401)
        {
          this.logout();
        }
        return of(null);
      })
    );
    }
      
    else
      return null;
  }
  viewSchoolName(event:any)
  {
    let viewStatus = event.target.value;

    if(viewStatus==3)
    {
      this.showSchoolName=1;
    }
    else
    {
      this.showSchoolName=0;
    }
  }


  onInsert(objValue:any){
    // return false;

    // TODO add extra validation or calculation before insert if any
    this.isLoading$.next(true);
    this.cdr.detectChanges();
    this.apiService.store(objValue)
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

                this.isLoading$.next(false);
                this.cdr.detectChanges();
              }
              else
              {
                this.isLoading$.next(false);
                this.cdr.detectChanges();
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
  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
  loadAssets()
  {
 const obj={
  projectType: this.projectType,
  categoryId: this.categoryId
 }
    this.apiService.getAsset(obj)
      .pipe(first())
      .subscribe(
        data => {
          if (data) {
              this.assetList = data.data;
              // console.log(this.assetList);
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

  loadCategories()
  {
 
    this.apiService.getCategory()
      .pipe(first())
      .subscribe(
        data => {
          if (data) {
              this.assetCtegoryList = data.data;
              // console.log(this.assetList);
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
  projectTypeChange(){
    this.categoryId = null;
    this.assetList = null;
    this.asset_type_id = null;
  }
}