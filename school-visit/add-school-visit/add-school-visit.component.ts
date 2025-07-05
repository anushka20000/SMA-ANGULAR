import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { BehaviorSubject, Observable, of, Subscription } from "rxjs";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "../../../modules/auth";
import { DemoServiceService } from "../../../services/demo-service.service";
import { first, catchError } from "rxjs/operators";
import { SchoolService } from "src/app/services/schoolnet/school.service";
import { map } from "rxjs/operators";
import * as moment from "moment";

@Component({
  selector: "app-add-school",
  templateUrl: "./add-school-visit.component.html",
  styleUrls: ["./add-school-visit.component.scss"],
})
export class AddSchoolVisitComponent implements OnInit, OnDestroy {
  @Output() OnAddForm = new EventEmitter<any>();
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading: boolean;
  addForm: FormGroup;
  engineerList: any;
  user$: Observable<any>;
  user: any;
  private unsubscribe: Subscription[] = [];
  //TODO Change this entity name
  public entityName: string = "School Visit";
  public project: any = 0;
  public engineerId: any = null;
  public showContcatDetails: number = 1;
  public type = 1;
  public schoolList: any;
  public schoolId: any = null;
  public today =  moment().format('YYYY-MM-DD')
  public fromDate:any = null;
  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private auth: AuthService,
    //TODO Change this service name
    private apiService: SchoolService
  ) {
    const loadingSubscr = this.isLoading$
      .asObservable()
      .subscribe((res) => (this.isLoading = res));
    this.unsubscribe.push(loadingSubscr);
    this.onInsertInit();
  }

  ngOnInit(): void {
    this.user$ = this.auth.currentUserSubject.asObservable();
    this.user$.subscribe((user) => {
      if (user) {
        console.log(this.today)
        this.loadSchools();
      } else {
        this.logout();
      }
    });
  }
  onInsertInit() {
    // TODO modify the array as per the form fields and validation
    this.addForm = this.fb.group({
      date: ["", Validators.required],
      // to: ["", Validators.required],
      school_id: ["", Validators.required],
      service_engineer: ["", Validators.required],
    });
  }
  onInsert(objValue: any) {
    // return false;

    // TODO add extra validation or calculation before insert if any

    this.apiService
      .storeVisit(objValue)
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
            this.router.navigate(["/school-visits/manage"]);
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
  logout() {
    this.auth.logout();
  }
  loadServiceEngineers(event: any) {
    this.addForm.get('service_engineer')!.setValue(event.User.id);

    this.engineerId = null;
    this.apiService
      .getServiceEngineer(this.type)
      .pipe(first())
      .subscribe(
        (data) => {
          if (data) {
            this.engineerList = data.data;
            console.log(event.User.user_name);
            this.cdr.detectChanges();
          } else {
            this.toastr.error(
              "Error :" + data.message + ", Please try again after sometime.",
              "Service Engineers",
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
            "Service Engineers",
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
  loadSchools() {
    this.apiService
      .getSchool()
      .pipe(first())
      .subscribe(
        (data: any) => {
          if (data) {
            this.schoolList = data.data;
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
  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
