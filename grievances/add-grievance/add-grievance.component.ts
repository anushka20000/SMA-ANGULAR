import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "../../../modules/auth";
import { first } from "rxjs/operators";
import { GrievanceService } from "src/app/services/schoolnet/grievance.service";
import { UserType } from "aws-sdk/clients/workdocs";
import { User } from "aws-sdk/clients/budgets";
import { Files } from "aws-sdk/clients/iotsitewise";

@Component({
  selector: "app-add-grievance",
  templateUrl: "./add-grievance.component.html",
  styleUrls: ["./add-grievance.component.scss"],
})
export class AddGrievanceComponent implements OnInit, OnDestroy {
  @Output() OnAddForm = new EventEmitter<any>();
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading: boolean;
  addForm: FormGroup;
  schoolList: any;
  assetList: any;
  issueList: any;
  user$: Observable<any>;
  user: any;
  private unsubscribe: Subscription[] = [];
  //TODO Change this entity name
  serviceEngineerId :any=null
  public pdfFile?: any;
  public pdfProgress: number = 0;
  public entityName: string = "Grievance";
  public schoolId: any = null;
  public assetId: any = null;
  public issueId: any = null;
  public projectType: any =null;
  public engineerList: any[];
  public projectTypeId: any;
  public oemList: any;
  public type1: any = 0;
  public type: any = 0;
  public showContcatDetails: number = 1;
  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private auth: AuthService,
    //TODO Change this service name
    private apiService: GrievanceService
  ) {
    const loadingSubscr = this.isLoading$
      .asObservable()
      .subscribe((res) => (this.isLoading = res));
    this.unsubscribe.push(loadingSubscr);
    this.onInsertInit();
  }

  ngOnInit(): void {
    // TODO call any service to fetch additional form data
    this.user$ = this.auth.currentUserSubject.asObservable();
    this.user$.subscribe((user) => {
      if (user) {
        console.log(user);
        this.user = user;
        if(user.type == 1 || user.type == 6 || user.type == 5 ){
          this.onTypeChange()
        }
        //console.log(user);
      } else {
        this.logout();
      }
    });
    this.loadSchools();
    
    
   
  }

  onInsertInit() {
    // TODO modify the array as per the form fields and validation
    this.addForm = this.fb.group({
      asset_id: ["", Validators.required],
      school_id: ["", Validators.required],
      issue_id: ["", Validators.required],
      support_type: ["", Validators.required],
      description: ["", Validators.required],
      file: [""],
      status: ["", Validators.required],
      service_engineer: [null],
      oem_id: [null],
    });
  }
  onTypeChange()
  {
    // this.cdr.detectChanges();
    let type = this.user.type
    console.log(type)
    const engineerId = this.addForm.get('service_engineer');

    const oemId = this.addForm.get('oem_id');
    if(type == 1 || type == 5 || type == 6)
    {
      
      engineerId?.setValidators(Validators.required);
      // oemId?.setValidators(Validators.required);
      this.cdr.detectChanges();
    }
    else 
    {
    
      engineerId?.clearValidators();
      oemId?.clearValidators();
      this.cdr.detectChanges();
    }
  }
  defaultContactChange(event: any) {
    this.showContcatDetails = event.target.value;
  }
  //  file: Files
  
   uploadFile(event: any) {
      
      this.pdfFile = event.addedFiles[0];
  }
  onInsert(objValue: any) {
    const formData = new FormData();
    formData.append('file', this.pdfFile);
    formData.append('data', JSON.stringify(objValue));
    this.apiService
      .store(formData)
      .pipe(first())
      .subscribe(
        (data) => {
          // console.log(data);
          if (data && data.success == true) {
            this.addForm.reset();

            this.toastr.success(
              this.entityName + " added successfully",
              "Add " + this.entityName,
              {
                timeOut: 3000,
                progressBar: true,
                tapToDismiss: true,
                toastClass: "flat-toast ngx-toastr",
              }
            );
            this.OnAddForm.emit(data);
            this.router.navigate(["/grievances/manage"]);
            this.isLoading$.next(false);
            this.cdr.detectChanges();
          } else {
            this.toastr.error(
              "Error Adding " +
                this.entityName +
                ":" +
                data.message +
                " Please try again after sometime.",
              "Add " + this.entityName,
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
          if (error.status == 401) {
            this.logout();
          }

          this.toastr.error(
            "Error:" + error.toString() + " Please try again after sometime.",
            "Add " + this.entityName,
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

  onRemovePdf(event:any)
  {
      delete this.pdfFile;
      this.pdfProgress=0;
  }
  logout() {
    this.auth.logout();
  }
  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
  loadSchools() {
    this.apiService
      .getSchool()
      .pipe(first())
      .subscribe(
        (data: any) => {
          if (data) {
            this.schoolList = data.data;
            if (this.schoolList && this.schoolList[0].name ) {
              // Set the default value for the "status" field
              // console.log(this.schoolList[0])
              if(this.user.type == 3){

                this.addForm.get('school_id')!.setValue(this.schoolList[0].id);
                this.addForm.get('status')!.setValue(0);

              }

              // console.log(this.details.status)
              // console.log(this.schoolId)
              this.loadAssets()
            }
            this.cdr.detectChanges();

          } else {
            this.toastr.error(
              "Error :" + data.message + ", Please try again after sometime.",
              "Schools",
              {
                timeOut: 3000,
                progressBar: true,
                tapToDismiss: true,
                toastClass: "flat-toast ngx-toastr",
              }
            );
          }
        },
        (error: any) => {
          this.toastr.error(
            "Error:" + error.toString() + ", Please try again after sometime.",
            "Schools",
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
  loadAssets() {
    this.assetId = null;
  

    this.apiService
      .getAsset(this.schoolId)
      .pipe(first())
      .subscribe(
        (data) => {
          if (data) {
            this.assetList = data.data;
            // console.log(this.assetList);
            this.cdr.detectChanges();
            // this.loadIssues()
          } else {
            this.toastr.error(
              "Error :" + data.message + ", Please try again after sometime.",
              "assets",
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
            "assets",
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
  loadIssues(e:any) {
    // console.log(e.assetTypeId)
    this.issueId = null;
    if(this.assetId !=null){

      this.apiService
        .getIssue(e.assetTypeId)
        .pipe(first())
        .subscribe(
          (data) => {
            if (data) {
              this.issueList = data.data;
              
              this.cdr.detectChanges();
            } else {
              this.toastr.error(
                "Error :" + data.message + ", Please try again after sometime.",
                "assets",
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
              "assets",
              {
                timeOut: 3000,
                progressBar: true,
                tapToDismiss: true,
                toastClass: "flat-toast ngx-toastr",
              }
            );
          }
        );
    }else{
      this.issueList = null;

    }
  }
  loadEngineers(event: any) {
    this.projectType = event.project;
    this.addForm.get('service_engineer')!.setValue(event.User.id);
    this.serviceEngineerId = event.User.id
    // console.log(event)
    this.type1 = 1;
    // console.log(event.User.user_name)
    this.apiService
      .getEngineers(this.type1)
      .pipe(first())
      .subscribe(
        (data: any) => {
          if (data) {
            this.engineerList = data.data;
            // if (this.engineerList.length > 0) {
            //   this.addForm.get('service_engineer')!.setValue(this.engineerList[0].id);
            // }
            this.cdr.detectChanges();
            // this.loadAssets()
          } else {
            this.toastr.error(
              "Error :" + data.message + ", Please try again after sometime.",
              "engineers",
              {
                timeOut: 3000,
                progressBar: true,
                tapToDismiss: true,
                toastClass: "flat-toast ngx-toastr",
              }
            );
          }
        },
        (error: any) => {
          this.toastr.error(
            "Error:" + error.toString() + ", Please try again after sometime.",
            "engineers",
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
  loadOem() {
    this.projectTypeId = this.schoolList[0].project;
    this.type = 2;
    // console.log(this.schoolList[0].project)
    this.apiService
      .getEngineers(this.type)
      .pipe(first())
      .subscribe(
        (data: any) => {
          if (data) {
            this.oemList = data.data;
            if (this.oemList.length > 0) {
              console.log(this.oemList[0].id)
              this.addForm.get('oem_id')!.setValue(this.oemList[0].id);
            }
           
            this.cdr.detectChanges();
            // this.loadAssets()
          } else {
            this.toastr.error(
              "Error :" + data.message + ", Please try again after sometime.",
              "engineers",
              {
                timeOut: 3000,
                progressBar: true,
                tapToDismiss: true,
                toastClass: "flat-toast ngx-toastr",
              }
            );
          }
        },
        (error: any) => {
          this.toastr.error(
            "Error:" + error.toString() + ", Please try again after sometime.",
            "engineers",
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
}
