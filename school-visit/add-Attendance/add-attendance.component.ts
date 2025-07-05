import {ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {BehaviorSubject,of, Subscription} from "rxjs";
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {AuthService} from "../../../modules/auth";
import {DemoServiceService} from "../../../services/demo-service.service";
import {first, catchError} from "rxjs/operators";
import { SchoolService } from 'src/app/services/schoolnet/school.service';
import {map} from "rxjs/operators";
import { SignaturePadComponent } from '@almothafar/angular-signature-pad';

@Component({
  selector: 'app-add-school',
  templateUrl: './add-attendance.component.html',
  styleUrls: ['./add-attendance.component.scss']
})
export class AddAttendanceComponent implements OnInit, OnDestroy {
  @Output() OnAddForm = new EventEmitter<any>();
  @ViewChild(SignaturePadComponent) signaturePad: SignaturePadComponent;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading: boolean;
  addForm: FormGroup;
  engineerList: any;
  schoolData:any;
  private unsubscribe: Subscription[] = [];
  //TODO Change this entity name
  public entityName: string = "Attendance";
  public project: any = 0;
  public engineerId: any = 0;
  public showDetails:any=0;
  public type:any=0;
  public visitType:any = 0
  public id:any;
  public checkIn:any;
  public checkOut:any;
  public signatureDataUrl:string
  public pdfFile?: any;
  public pdfProgress: number = 0;
  lat: number | undefined;
  lon: number | undefined;
  mapVisible = false;
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
      this.visitType = params.get('type');

      if(this.id > 0){
        this.loadSchoolVisit()
      }
    });
    
  }

  onInsertInit()
  {
    // TODO modify the array as per the form fields and validation
    this.addForm = this.fb.group({
    
      check_out: ['',[ Validators.required, this.minTimeValidator.bind(this)]],
      check_in: ['', Validators.required],
      feedback: ['', Validators.required],
      status: ['', Validators.required],
      sign: [''],
        file: [''],
        lat: [null],
        long: [null]
        // method: [''],
        // checkbox: ['', Validators.required],
  


    });
  }
  captureLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.lat = position.coords.latitude;
          this.lon = position.coords.longitude;
          this.addForm.patchValue({
            lat: this.lat,
            long: this.lon
          });
          console.log(this.lat, this.lon)
        },
        (error) => {
          console.error('Error getting location: ', error);
          // Handle location error (e.g., show a message to the user)
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      // Handle lack of geolocation support (e.g., show a message to the user)
    }
  }
  ngAfterViewInit() {
    this.signaturePad.set('minWidth', this.signaturePadOptions.minWidth);
    this.signaturePad.set('canvasWidth', this.signaturePadOptions.canvasWidth);
    this.signaturePad.set('canvasHeight', this.signaturePadOptions.canvasHeight);
    this.signaturePad.clear(); // Clear the pad if needed
  }
  signaturePadOptions = {
    minWidth: 5,
    canvasWidth: 300,
    canvasHeight: 100
  };
  saveSignature() {
    if (this.signaturePad.isEmpty()) {
      console.warn('SignaturePad is empty');
      return;
    }

   this.signatureDataUrl = this.signaturePad.toDataURL();
    if (this.signatureDataUrl) {
      // this.addForm.get('sign')?.setValue(this.signatureDataUrl);
      console.log('Signature Data URL:', this.signatureDataUrl);
    } else {
      console.error('Failed to get Signature Data URL');
    }
  }
  
  clearSignature() {
    this.signaturePad.clear();
  }
    defaultContactChange(event:any)
    {
        this.showDetails = event.target.value;
        // console.log(this.showDetails)
    }

    dataURLtoBlob(dataURL: string): Blob {
      const byteString = atob(dataURL.split(',')[1]);
      const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: mimeString });
    }
    
  onInsert(objValue:any){

    const formData = new FormData();
    const schoolVisitId = { visit_id: this.id };

    if(this.signatureDataUrl){

      const blob = this.dataURLtoBlob(this.signatureDataUrl);
      formData.append('sign', blob, 'signature.png');
    }
    if (this.pdfFile) {
      formData.append('file', this.pdfFile, this.pdfFile.name);
    }
    // Append the other data as JSON strings
    formData.append('objValue', JSON.stringify(objValue));
    formData.append('schoolVisitId', JSON.stringify(schoolVisitId));
    this.apiService.storeAttendance(formData)
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
                this.router.navigate(['/school-visits/manage'])
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
  onTypeChange(e:any)
  {
    this.cdr.detectChanges();
    let type = e.target.value;
    console.log("tutorial_type----"+type);

    const file = this.addForm.get('file');
    const sign = this.addForm.get('sign');
  
 


    if(type == 1)
    {
      file?.setValidators(Validators.required);
      sign?.clearValidators();

     
    
      this.cdr.detectChanges();
      

      
    }
    else if(type == 0)
    {
    //  console.log(type)
      
      sign?.clearValidators();
      file?.clearValidators();
   
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
  loadSchoolVisit() {
    this.apiService
      .getSchoolName(this.id)
      .pipe(first())
      .subscribe(
        (data) => {
          if (data) {
            this.schoolData = data.data;
         

            this.cdr.detectChanges();
        this.captureLocation();

          } else {
            this.toastr.error(
              "Error :" + data.message + ", Please try again after sometime.",
              "School Visit",
              {
                timeOut: 3000,
                progressBar: true,
                tapToDismiss: true,
                toastClass: "flat-toast ngx-toastr",
              }
            );
          }
        },
        (error) => {
          this.toastr.error(
            "Error:" + error.toString() + ", Please try again after sometime.",
            "School Visit",
            {
              timeOut: 3000,
              progressBar: true,
              tapToDismiss: true,
              toastClass: "flat-toast ngx-toastr",
            }
          );
        }
      );
  }

minTimeValidator(control: AbstractControl){
// console.log(control)


    if (control.value < this.checkIn) {
      // console.log(control.value < this.checkIn)
      return { 'minTimeViolation': true };
    }

 
}
uploadFile(event: any) {
      
  this.pdfFile = event.addedFiles[0];
  this.addForm.patchValue({file: this.pdfFile});
}
onRemovePdf(event:any)
{
    delete this.pdfFile;
    this.pdfProgress=0;
}
}