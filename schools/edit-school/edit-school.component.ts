import {ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {BehaviorSubject,of, Subscription} from "rxjs";
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {AuthService} from "../../../modules/auth";
import {DemoServiceService} from "../../../services/demo-service.service";
import {first, catchError} from "rxjs/operators";
import { SchoolService } from 'src/app/services/schoolnet/school.service';
import {map} from "rxjs/operators";

@Component({
  selector: 'app-add-school',
  templateUrl: './edit-school.component.html',
  styleUrls: ['./edit-school.component.scss']
})
export class EditSchoolComponent implements OnInit, OnDestroy {
  @Output() OnEditForm = new EventEmitter<any>();
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading: boolean;
  addForm: FormGroup;
  engineerList: any;
  dataSet:any
  ifp:any = false;
  kyan:any = false;
  private unsubscribe: Subscription[] = [];
  //TODO Change this entity name
  public entityName: string = "School";
  public project: any = 0;
  public engineerId: any = 0;
  public showContcatDetails:number=1;
  public type = 1;
  public id: any = 0;
  constructor(private cdr: ChangeDetectorRef, private router:Router,private fb: FormBuilder,
              private toastr:ToastrService,
              private auth: AuthService,
              private route: ActivatedRoute,
              //TODO Change this service name
              private apiService:SchoolService) {
    const loadingSubscr = this.isLoading$
        .asObservable()
        .subscribe((res) => (this.isLoading = res));
    this.unsubscribe.push(loadingSubscr);
    this.onInsertInit();


  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.id = params.get('id');
      if(this.id !=null)
      {
        if(this.id>0)
        {
          this.onUpdateInit();
          Object.keys(this.addForm.controls).forEach(field => {
            const control :any= this.addForm.get(field);
          if(field == 'code' || field == "schoolnet_code" || field == "block"){
            control.status = 'VALID'
            control.errors = null
          }
          // this.cdr.detectChanges();
          });
        }
      }
    });
    
  }
  onInsertInit()
  {
    // TODO modify the array as per the form fields and validation
    this.addForm = this.fb.group({
      UDISE_code: ['', Validators.required],
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
        contact_person_number: [null],
        contact_person_designation: [''],
        ifp: [0],
        kyan: [0],
        block: [''],
        schoolnet_code: ['']


    });
  }
  // codeUniquenessValidator(control: AbstractControl) {
  //   // console.log(control.value)
  //   if(control.value!="" && control.value!=null){
  //   return this.apiService.checkUniqueness({UDISE_code: control.value}).pipe(
  //     map( (res: any) =>
  //      (res && res.success===true ? null : { code: true })
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

  // }
    defaultContactChange(event:any)
    {
        this.showContcatDetails = event.target.value;
    }


 
  onTypeChange()
  {
    this.cdr.detectChanges();
    let type = this.addForm.get('gengerRadio')?.value;


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
  onUpdateInit()
  {
    this.apiService.getValue(this.id)
      .pipe(first())
      .subscribe(
        data => {
          if (data.data) {
            this.kyan = data.data.kyan == 1 ? true : false;
            this.ifp = data.data.ifp == 1 ? true : false;

            this.loadServiceEngineers()
            // console.log(data.data)
            this.addForm.setValue({
              school_type: data.data.school_type,
              name:data.data.name,
              UDISE_code: data.data.UDISE_code,
              district: data.data.district,
              master_name: data.data.master_name,
              master_number: data.data.master_number,
              service_engineer: data.data.service_engineer,
              contact_person: data.data.contact_person,
              code: data.data.code,
              contact_person_number: data.data.contact_person_number,
              contact_person_designation: data.data.contact_person_designation,
              ifp: data.data.ifp,
              kyan: data.data.kyan,
              block: data.data.block,
              address: data.data.address,
              pincode : data.data.pincode,
              schoolnet_code: data.data.schoolnet_code
            });
            Object.keys(this.addForm.controls).forEach(field => {
              const control :any= this.addForm.get(field);
            if(field == 'code' || field == "schoolnet_code" || field == "block"){
              control.status = 'VALID'
              control.errors = null
            }
            this.cdr.detectChanges();
            });
           
            if (this.addForm.valid) {
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
    this.apiService.update(objValue,this.id)
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
            this.router.navigate(['/schools'])
            this.isLoading$.next(false);
            this.cdr.detectChanges();

          }
          else
          {
            this.toastr.error("Error :"+data.message+", Please try again after sometime.",
              'Edit School',{
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
            'Edit School',{
              timeOut: 3000,
              progressBar:true,
              tapToDismiss:true,
              toastClass: 'flat-toast ngx-toastr'
            });
        });
  }

}