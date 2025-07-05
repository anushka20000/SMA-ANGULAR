import {ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {BehaviorSubject,of, Subscription} from "rxjs";
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {AuthService} from "../../../modules/auth";
import {DemoServiceService} from "../../../services/demo-service.service";
import {first, catchError} from "rxjs/operators";
import { SchoolService } from 'src/app/services/schoolnet/school.service';
import {map} from "rxjs/operators";

@Component({
  selector: 'app-add-school',
  templateUrl: './add-school.component.html',
  styleUrls: ['./add-school.component.scss']
})
export class AddSchoolComponent implements OnInit, OnDestroy {
  @Output() OnAddForm = new EventEmitter<any>();
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading: boolean;
  addForm: FormGroup;
  engineerList: any;

  ifp:any = true;
  kyan:any = false;
  private unsubscribe: Subscription[] = [];
  //TODO Change this entity name
  public entityName: string = "School";
  public project: any = 0;
  public engineerId: any = 0;
  public showContcatDetails:number=1;
  public type = 1;
  constructor(private cdr: ChangeDetectorRef, private router:Router,private fb: FormBuilder,
              private toastr:ToastrService,
              private auth: AuthService,
              //TODO Change this service name
              private apiService:SchoolService) {
    const loadingSubscr = this.isLoading$
        .asObservable()
        .subscribe((res) => (this.isLoading = res));
    this.unsubscribe.push(loadingSubscr);
    this.onInsertInit();


  }

  ngOnInit(): void {
    // TODO call any service to fetch additional form data
    this.loadServiceEngineers()
  }

  onInsertInit()
  {
    // TODO modify the array as per the form fields and validation
    this.addForm = this.fb.group({
      UDISE_code: ['', Validators.required, [this.codeUniquenessValidator.bind(this)]],
      name: ['', Validators.required],
        school_type: ['', Validators.required],
        code: [],
        address: ['', Validators.required],
        pincode: ['', Validators.required],
        district: ['', Validators.required],
        master_name: ['', Validators.required],
        master_number: [null,[Validators.required, Validators.pattern('^[0-9]{10}$')]],
        service_engineer: ['', Validators.required],
        contact_person: [''],
        contact_person_number: [null, Validators.pattern('^[0-9]{10}$')],
        contact_person_designation: [''],
        ifp: [0],
        kyan: [0],
        block: [],
        schoolnet_code: []


    });
  }
  codeUniquenessValidator(control: AbstractControl) {
    // console.log(control.value)
    if(control.value!="" && control.value!=null){
    return this.apiService.checkUniqueness({UDISE_code: control.value}).pipe(
      map( (res: any) =>
       (res && res.success===true ? null : { code: true })
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

  }
    defaultContactChange(event:any)
    {
        this.showContcatDetails = event.target.value;
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
  onTypeChange()
  {
    this.cdr.detectChanges();
    let type = this.addForm.get('gengerRadio')?.value;
    console.log("tutorial_type"+type);

    const contact_person = this.addForm.get('contact_person');
    const contact_person_number = this.addForm.get('contact_person_number');
    const contact_person_designation = this.addForm.get('contact_person_designation');
 


    if(type == 2 )
    {
      contact_person?.setValidators(Validators.required);
      contact_person_number?.setValidators(Validators.required);
      contact_person_designation?.setValidators(Validators.required);
     
    
      this.cdr.detectChanges();
      

      
    }
    else if(type == 1)
    {
     console.log(type)
      
      contact_person?.clearValidators();
      contact_person_number?.clearValidators();
      contact_person_designation?.clearValidators();
      this.cdr.detectChanges();
      
    }

    //this.filterByType(type);
  }
  logout() {
    this.auth.logout();
  }
  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
  loadServiceEngineers()
  {
    // console.log(event.target.name)
    // const ifp = event.target.name == 'ifp' ? (event.target.checked ? event.target.value : 0) : null
    // const kyan = event.target.name == 'kyan' ? (event.target.checked ? event.target.value : 0) : null

    this.engineerId = null
    this.apiService.getServiceEngineers(this.type, this.ifp,this.kyan)
      .pipe(first())
      .subscribe(
        data => {
          if (data) {
              this.engineerList = data.data;
              console.log(this.engineerList);
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