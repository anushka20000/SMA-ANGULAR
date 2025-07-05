import {ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {BehaviorSubject, Observable, of, Subscription} from "rxjs";
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {first, catchError} from "rxjs/operators";
import {AuthService} from "../../../modules/auth"
import { UserService } from 'src/app/services/user.service';
import {map} from "rxjs/operators";
import { UserType } from 'aws-sdk/clients/workdocs';
import { User } from 'aws-sdk/clients/budgets';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit, OnDestroy {
  @Output() OnEditForm = new EventEmitter<any>();
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading: boolean;
  addForm: FormGroup;
  private unsubscribe: Subscription[] = [];
  public entityName: string = "User";
  schoolList: any;
  userData: any;
  public hideDistrict:number=0;
  public showSchoolName:number=0;
  public showProject: number = 0;
  public selectProject: number = 0;
  user$: Observable<any>;
  user:any;
  _id:any;
  constructor(private cdr: ChangeDetectorRef ,private router:Router,private fb: FormBuilder,
              private toastr:ToastrService,
              private auth: AuthService,
              //TODO Change this service name
              private apiService: UserService,private route: ActivatedRoute) {
    const loadingSubscr = this.isLoading$
        .asObservable()
        .subscribe((res) => (this.isLoading = res));
    this.unsubscribe.push(loadingSubscr);
    this.onInsertInit();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this._id = params.get('id');
      if(this._id !=null)
      {
        if(this._id>0)
        {
          console.log(this._id)
          this.onUpdateInit()
        }
      }
    });
    //  this.unsubscribe.push(paramsSubscription);
    this.user$ = this.auth.currentUserSubject.asObservable();
    this.user$.subscribe(user => {
      if(user)
      {
      //  console.log(user)
        this.user = user;
        //console.log(user);
      }
      else
      {
        this.logout();
      }
    })
    // TODO call any service to fetch additional form data
    this.loadSchool()
  }

  onInsertInit()
  {
    // TODO modify the array as per the form fields and validation
    this.addForm = this.fb.group({
        user_type: ['', Validators.required],
        user_name: ['', Validators.required],
        school_id: [null],
        phone: [null,[Validators.required, Validators.pattern(/^(\+?\d{10,})$/)]],
        email: ['', [Validators.required, Validators.email]],
        role: ['', Validators.required],
        district: [''],
        address: ['', Validators.required],
        gender: [''],
        project: [0]
    });
  }
  onTypeChange()
  {
    // this.cdr.detectChanges();
    let type = this.addForm.get('user_type')?.value;
    console.log(type)
    const projectId = this.addForm.get('project');
    const schoolId = this.addForm.get('school_id');
    const district = this.addForm.get('district');

    if(type == 1 || type == 2)
    {
      projectId?.clearValidators();
      schoolId?.clearValidators();
      district?.setValidators(Validators.required);
      this.hideDistrict = 0
      this.cdr.detectChanges();
      
    }else if(type == 3){
      projectId?.setValidators(Validators.required);
      schoolId?.setValidators(Validators.required);
      district?.setValidators(Validators.required);
      this.hideDistrict = 0
      this.cdr.detectChanges();
    }
    else if(type == 6){
      projectId?.clearValidators();
      schoolId?.clearValidators();
      district?.clearValidators();
      this.hideDistrict = 1
      this.cdr.detectChanges();
    }
    else 
    {
      projectId?.setValidators(Validators.required);
      district?.setValidators(Validators.required);
      schoolId?.clearValidators();
      this.hideDistrict = 0
      this.cdr.detectChanges();
    }
  }
    viewSchoolName(event:any)
    {
    const district = this.addForm.get('district');

        let viewStatus = event.target.value;
        if(viewStatus==3)
        {
          console.log(viewStatus)
          this.showSchoolName=1;
          console.log(this.showProject)
         this.hideDistrict = 0     
        }else if(viewStatus == 4 || viewStatus == 5 ){
          this.showProject =2;
          this.showSchoolName=0;
         this.selectProject =0;
         this.hideDistrict = 0
        }else if(viewStatus == 6){
          this.showProject = 0
          this.showSchoolName=0;
          this.hideDistrict = 1
          district?.clearValidators();
          this.cdr.detectChanges();
        }
        else
        {
            this.showSchoolName=0;
            this.showProject = 0
            this.hideDistrict = 0
        }

    }
 hideDistrictComponent(e:any){
  const district = this.addForm.get('district');

  if(e == 6){
    this.showProject = 0
    this.showSchoolName=0;
    this.hideDistrict = 1
    district?.clearValidators();
    this.cdr.detectChanges();
  }else{
    this.hideDistrict = 0
    district?.setValidators(Validators.required);
    this.cdr.detectChanges();

  }
 }

  // emailUniquenessValidator(control: AbstractControl) {
  //   // console.log(control.value)
  //   if(control.value!="" && control.value!=null){
  //   return this.apiService.checkEmailUniqueness({email: control.value}).pipe(
  //     map( (res: any) =>
  //      (res && res.success===true ? null : { emailExists: true })
  //      ),
  //     catchError(err => {
  //       if(err.status===401)
  //       {
  //         this.logout();
  //       }
  //       return of(null);
  //     })
  //   );
  //   }
      
  //   else
  //     return null;
  // }
  // phoneUniquenessValidator(control: AbstractControl) {
  //   // console.log(control.value)
  //   if(control.value!="" && control.value!=null){
  //   return this.apiService.checkPhoneUniqueness({phone: control.value}).pipe(
  //     map( (res: any) =>
  //      (res && res.success===true ? null : { phoneExists: true })
  //      ),
  //     catchError(err => {
  //       if(err.status===401)
  //       {
  //         this.logout();
  //       }
  //       return of(null);
  //     })
  //   );
  //   }
      
  //   else
  //     return null;
  // }
  logout() {
    this.auth.logout();
  }
  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
  loadSchool()
  {
    this.apiService.getSchools()
      .pipe(first())
      .subscribe(
        (data:any) => {
          if (data) {
              this.schoolList = data.data;
              // this.selectProject = data.data.project;
              console.log(data.data);
              this.cdr.detectChanges();
          }
          else
          {
            this.toastr.error("Error :"+data.message+", Please try again after sometime.",
              'Schools',{
                timeOut: 3000,
                progressBar:true,
                tapToDismiss:true,
                toastClass: 'flat-toast ngx-toastr'
              });
          }
        },
        (error: any) => {
          this.toastr.error("Error:"+error.toString()+", Please try again after sometime.",
            'Schools',{
              timeOut: 3000,
              progressBar:true,
              tapToDismiss:true,
              toastClass: 'flat-toast ngx-toastr'
            });
        });
  }
  filterProjectType(event: any){
    console.log(event.project)
    console.log(event.id)
    this.selectProject = event.project;
  }
  onUpdateInit()
  {
    this.apiService.getValue(this._id)
      .pipe(first())
      .subscribe(
        data => {
          if (data.data) {
            this.addForm.setValue({
              user_type: data.data.user_type,
              user_name: data.data.user_name,
              school_id: data.data.school_id,
              phone: data.data.phone,
              email: data.data.email,
              role: data.data.role,
              district: data.data.district,
              gender: data.data.gender,
              project: data.data.project,
              address: data.data.address,
              
            });

            this.hideDistrictComponent(data.data.user_type)

            Object.keys(this.addForm.controls).forEach(field => {
              const control :any= this.addForm.get(field);
            // if(field == 'code' || field == "schoolnet_code" || field == "block"){
            //   control.status = 'VALID'
            //   control.errors = null
            // }
            // this.cdr.detectChanges();
            console.log(control)
            });
           
            if (this.addForm.valid) {
              console.log('hi')
              this.isLoading = true;
            }
          }
          else
          {
            alert("Internal server error, Please try again after sometime.");
          }
        },
        error => {
          alert("Internal server error, Please try again after sometime.");
        });
  }
  onUpdate(objValue:any){
    this.isLoading$.next(true);
   // return false;
    this.apiService.update(objValue,this._id)
      .pipe(first())
      .subscribe(
        data => {
          console.log(data);
          if (data && data.success==true) {
            this.toastr.success('School Updated Successfully', 'Updated',{
              timeOut: 3000,
              progressBar:true,
              tapToDismiss:true,
              toastClass: 'flat-toast ngx-toastr'
            });
            
            this.OnEditForm.emit(data);
            this.router.navigate(['/users'])
            this.isLoading$.next(false);
            this.cdr.detectChanges();

          }
          else
          {
            this.toastr.error("Error :"+data.message+", Please try again after sometime.",
              'Edit User',{
                timeOut: 3000,
                progressBar:true,
                tapToDismiss:true,
                toastClass: 'flat-toast ngx-toastr'
              });
           this.isLoading$.next(false);
           this.cdr.detectChanges();
          }
        },
        error => {
          this.toastr.error("Error:"+error.toString()+", Please try again after sometime.",
            'Edit User',{
              timeOut: 3000,
              progressBar:true,
              tapToDismiss:true,
              toastClass: 'flat-toast ngx-toastr'
            });
        });
  }
}