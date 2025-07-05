import {ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from "rxjs";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {AuthService} from "../../../modules/auth";
import {first} from "rxjs/operators";
import { GrievanceService } from 'src/app/services/schoolnet/grievance.service';
import { UserType } from 'aws-sdk/clients/workdocs';
import { User } from 'aws-sdk/clients/budgets';
import * as moment from 'moment';
import { saveAs } from 'file-saver';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-grievance-details',
  templateUrl: './grievance-details.component.html',
  styleUrls: ['./grievance-details.component.scss']
})
export class GrievanceDetailsComponent {

  @Output() OnAddForm = new EventEmitter<any>();
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading: boolean;
  addForm: FormGroup;
  details: any;
  public pdfFile?: any;
  public pdfProgress: number = 0;
  grievanceTimelineDetails: any
  assetList: any;
  issueList: any;
  user$: Observable<any>;
  user:any;
  private unsubscribe: Subscription[] = [];
  //TODO Change this entity name
  public entityName: string = "Grievance";
  public schoolId: any = 0;
  public assetId: any = 0;
  public issueId: any = 0;
  public projectType: any;
  public engineerList: any;
  public projectTypeId: any;
  serviceEngineerId :any =null;
  public oemID:any = null;
  public oemList: any;
  public type1: any = 0;
  public type: any = 0;
  public id:any = 0;
  public showContcatDetails:number=1;
  public date: any;
  public visitDate: any;
  public setShowOem: any = false;
  public formattedVisitDate :any;
  public minDate = new Date().toISOString().split('T')[0]
  constructor(private cdr: ChangeDetectorRef, private router:Router,private fb: FormBuilder,
              private toastr:ToastrService, private route: ActivatedRoute,
              private auth: AuthService,
              //TODO Change this service name
              private apiService:GrievanceService) {
    const loadingSubscr = this.isLoading$
        .asObservable()
        .subscribe((res) => (this.isLoading = res));
    this.unsubscribe.push(loadingSubscr);
    this.onInsertInit();


  }

  ngOnInit(): void {
    
    this.route.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id');
      if(id !=null)
      {
        this.id = +id;
        if(this.id>0)
        {
          //this.showDrawer("live_chat_drawer");
          this.loadGrievanceDetails()
          
        }
      }
    });
   

  
    // TODO call any service to fetch additional form data
    this.user$ = this.auth.currentUserSubject.asObservable();
   this.user$.subscribe(user => {
     if(user)
     {
      console.log(user)
       this.user = user;
       //console.log(user);
     }
     else
     {
       this.logout();
     }
   })
    
  }

  onInsertInit()
  {
    // TODO modify the array as per the form fields and validation
    this.addForm = this.fb.group({
      visit_date: [''],
      status: ['', Validators.required],
      service_engineer: [null],
      oem_id: [null],
      description: ['']
    });
  }

  images: { name: string; preview: string; file: File }[] = [];

  uploadFiles(event: any): void {
    for (const file of event.addedFiles) {
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        this.images.push({
          name: file.name,
          preview: e.target.result,
          file: file
        });
      };
      
      reader.readAsDataURL(file);
    }
  }
  onRemoveImage(image: any): void {
    this.images = this.images.filter(img => img !== image);
  }

    defaultContactChange(event:any)
    {
        this.showContcatDetails = event.target.value;
    }
  
    uploadFile(event: any) {
      this.pdfFile = event.addedFiles[0];    
    
  }
  onInsert(objValue:any){
    // return false;

    // TODO add extra validation or calculation before insert if any
    // objValue += {id: this.id}
    const grievanceID = this.id
    // console.log(grievanceID)
    // if(this.details.visit_date !== null && objValue.visit_date == ""){
    //   objValue.visit_date = moment(this.details.visit_date).format('DD/MM/YYYY')
    // }
    // if(objValue.status == 1){
    //   objValue.oem_id = null

    // }
    const formData = new FormData();
    formData.append('file', this.pdfFile);
    formData.append('data', JSON.stringify({grievanceID,objValue}));
    // formData.append('grievanceID', grievanceID);

    this.apiService.update(formData)
        .pipe(first())
        .subscribe(
            data => {
              // console.log(data);
              if (data && data.success==true) {
                console.log(data)
                this.addForm.reset();


                this.toastr.success(this.entityName+' updated successfully', 'update '+this.entityName,{
                  timeOut: 3000,
                  progressBar:true,
                  tapToDismiss:true,
                  toastClass: 'flat-toast ngx-toastr'
                });
                this.OnAddForm.emit(data);
                this.router.navigate(['/grievances/manage'])
                this.isLoading$.next(false);
                this.cdr.detectChanges();
              }
              else
              {
                this.toastr.error("Error Adding "+this.entityName+":"+data.message+ " Please try again after sometime.",
                    'update '+this.entityName,{
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
  onTypeChange(event:any)
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
  loadGrievanceDetails()
  {
    this.apiService.getGrievanceDetails(this.id)
      .pipe(first())
      .subscribe(
        (data: any) => {
          if (data) {
            
              this.details = data.data;
            
              this.grievanceTimelineDetails = data.data.grievanceTimeline
              this.date = moment(this.details?.visit_date).format('DD/MM/YYYY')
     
              this.loadEngineers()
              this.loadOem()
              console.log(this.details)
              this.addForm.get('status')!.setValue(this.details.status);
              // this.addForm.get('description')!.setValue(this.details.description);
              // this.addForm.get('service_engineer')!.setValue(this.details.service_engineer);
              this.formattedVisitDate = moment(this.details?.visit_date).format('DD/MM/YYYY')
              this.addForm.get('visit_date')!.setValue(this.details?.visit_date);
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
        (error : any) => {
          this.toastr.error("Error:"+error.toString()+", Please try again after sometime.",
            'Schools',{
              timeOut: 3000,
              progressBar:true,
              tapToDismiss:true,
              toastClass: 'flat-toast ngx-toastr'
            });
        });
  }
  
  loadEngineers()
  {
    
    this.serviceEngineerId = this.details.service_engineer
    this.type1 = 1
    this.apiService.getEngineers(this.type1)
      .pipe(first())
      .subscribe(
        (data: any) => {
          if (data) {
            if (this.details && this.details.service_engineer !== '') {
              this.addForm.get('service_engineer')!.setValue(this.details.service_engineer);
            }
            this.engineerList = data.data;
              this.cdr.detectChanges();
              // this.loadAssets()
          }
          else
          {
            this.toastr.error("Error :"+data.message+", Please try again after sometime.",
              'engineers',{
                timeOut: 3000,
                progressBar:true,
                tapToDismiss:true,
                toastClass: 'flat-toast ngx-toastr'
              });
          }
        },
        (error : any) => {
          this.toastr.error("Error:"+error.toString()+", Please try again after sometime.",
            'engineers',{
              timeOut: 3000,
              progressBar:true,
              tapToDismiss:true,
              toastClass: 'flat-toast ngx-toastr'
            });
        });
  }
  showOEM(e:any){
    // console.log(e.target.value)
    if(e.target.value == 2){
      this.setShowOem = true
      this.loadOem()
    }
  }
  loadOem()
  {
    this.projectTypeId = this.details.project;
    this.type = 2
    // console.log(this.schoolList[0].project)
    this.apiService.getEngineers(this.type)
      .pipe(first())
      .subscribe(
        (data: any) => {
          if (data) {
              this.oemList = data.data;
              this.cdr.detectChanges();
              if (this.details && this.details.service_engineer !== '') {
                this.addForm.get('oem_id')!.setValue(this.details.oem);
              }
          }
          else
          {
            this.toastr.error("Error :"+data.message+", Please try again after sometime.",
              'engineers',{
                timeOut: 3000,
                progressBar:true,
                tapToDismiss:true,
                toastClass: 'flat-toast ngx-toastr'
              });
          }
        },
        (error : any) => {
          this.toastr.error("Error:"+error.toString()+", Please try again after sometime.",
            'engineers',{
              timeOut: 3000,
              progressBar:true,
              tapToDismiss:true,
              toastClass: 'flat-toast ngx-toastr'
            });
        });
  }
  onRemovePdf(event:any)
  {
      delete this.pdfFile;
      this.pdfProgress=0;
  }
  getDownloadLink(filePath: string): string {
    console.log(`${environment.url}${filePath}`)
    return `${environment.url}${filePath}`;
  }
}
