import {ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {BehaviorSubject, Observable, of, Subscription} from "rxjs";
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {first, catchError} from "rxjs/operators";
import {AuthService} from "../../../modules/auth"
import { UserService } from 'src/app/services/user.service';
import {map} from "rxjs/operators";
import { UserType } from 'aws-sdk/clients/workdocs';
import { User } from 'aws-sdk/clients/budgets';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit, OnDestroy {
  @Output() OnAddForm = new EventEmitter<any>();
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading: boolean;
  addForm: FormGroup;
  private unsubscribe: Subscription[] = [];
  public entityName: string = "User";
  schoolList: any;
  public showSchoolName:number=0;
  public hideDistrict:number=0;
  public showProject: number = 0;
  public selectProject: number = 0;
  user$: Observable<any>;
  user:any;
  constructor(private cdr: ChangeDetectorRef, private router:Router,private fb: FormBuilder,
              private toastr:ToastrService,
              private auth: AuthService,
              //TODO Change this service name
              private apiService: UserService) {
    const loadingSubscr = this.isLoading$
        .asObservable()
        .subscribe((res) => (this.isLoading = res));
    this.unsubscribe.push(loadingSubscr);
    this.onInsertInit();
  }

  ngOnInit(): void {
    this.user$ = this.auth.currentUserSubject.asObservable();
    this.user$.subscribe(user => {
      if(user)
      {
      
        this.user = user;
       
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
        phone: [null,[Validators.required, Validators.pattern(/^(\+?\d{10,})$/)], [this.phoneUniquenessValidator.bind(this)]],
        email: ['', [Validators.required, Validators.email], [this.emailUniquenessValidator.bind(this)]],
        role: ['', Validators.required],
        district: [''],
        address: ['', Validators.required],
        gender: [''],
        project: [0]
    });
  }
  onTypeChange()
  {
    
    let type = this.addForm.get('user_type')?.value;

    const projectId = this.addForm.get('project');
    const schoolId = this.addForm.get('school_id');
    const district = this.addForm.get('district');

      if(type == 1 || type == 2)
    {
      projectId?.clearValidators();
      schoolId?.clearValidators();
      district?.setValidators(Validators.required);
      this.cdr.detectChanges();
      
    }else if(type == 3){
      console.log(type)
      projectId?.setValidators(Validators.required);
      schoolId?.setValidators(Validators.required);
      district?.setValidators(Validators.required);
      this.cdr.detectChanges();
    }
    else if(type == 6){
      console.log(type)

      projectId?.clearValidators();
      schoolId?.clearValidators();
      district?.clearValidators();
      this.cdr.detectChanges();
    }
    else if(type == 4)
    {
      projectId?.setValidators(Validators.required);
      district?.setValidators(Validators.required);
      schoolId?.clearValidators();
      this.cdr.detectChanges();
    }else{
      projectId?.setValidators(Validators.required);
      schoolId?.setValidators(Validators.required);
      district?.setValidators(Validators.required);
      this.cdr.detectChanges();

    }
  }
    viewSchoolName(event:any)
    {
    const district = this.addForm.get('district');

        let viewStatus = event.target.value;
        if(viewStatus==3)
        {
          this.showSchoolName=1;
          this.hideDistrict = 0
        }else if(viewStatus == 4 || viewStatus == 5 ){
          
          this.showProject =2;
          this.showSchoolName=0;
          this.selectProject =0;
          this.hideDistrict = 0

        }
        else if(viewStatus == 6){
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
  onInsert(objValue:any){

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
                this.router.navigate(['/users'])
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
  emailUniquenessValidator(control: AbstractControl) {
    // console.log(control.value)
    if(control.value!="" && control.value!=null){
    return this.apiService.checkEmailUniqueness({email: control.value}).pipe(
      map( (res: any) =>
       (res && res.success===true ? null : { emailExists: true })
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
  phoneUniquenessValidator(control: AbstractControl) {
    // console.log(control.value)
    if(control.value!="" && control.value!=null){
    return this.apiService.checkPhoneUniqueness({phone: control.value}).pipe(
      map( (res: any) =>
       (res && res.success===true ? null : { phoneExists: true })
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
              // console.log(this.schoolList)
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
    // console.log(event.project)
    // console.log(event)
    // this.addForm.get('project')!.setValue(event.project);
    // this.addForm.get('email')!.setValue(event.name.toLowerCase().replace(/ /g, '_')+'@gmail.com');
    // this.addForm.get('phone')!.setValue(event.master_number);
    // this.addForm.get('role')!.setValue("Head Master");
    // this.addForm.get('district')!.setValue(event.district);
    // this.addForm.get('address')!.setValue(event.address);
    // this.addForm.get('user_name')!.setValue(event.master_name);

    // this.selectProject = event.project;
  }
}