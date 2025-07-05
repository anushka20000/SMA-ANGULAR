import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { EmployeeFormsService } from "../../services/employeeForms.service";
import { DataTableDirective } from "angular-datatables";
import { Observable } from "rxjs";
import { AuthService, UserType } from "../../modules/auth";
import { User } from "../../modules/auth/models/AuthResponse";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { environment } from "../../../environments/environment";
import { DataTablesResponse } from "../../modules/DataTables/DataTablesResponse";
import * as moment from "moment/moment";
import { DrawerComponent } from "../../_metronic/kt/components";
import { UserService } from "src/app/services/user.service";
//import { ModalConfig, ModalComponent } from '../../_metronic/partials';
import { first, catchError } from "rxjs/operators";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  selectedForm: number = 0;
  user$: Observable<UserType>;
  user: User | null = null;
  attendance: any = null;
  bonus: any = null;
  injury: any = null;
  public dashboard: any;
  public management: any;

 



  // modalConfig: ModalConfig = {
  //   modalTitle: 'Modal title',
  //   dismissButtonLabel: 'Submit',
  //   closeButtonLabel: 'Cancel'
  // };
  //@ViewChild('modal') private modalComponent: ModalComponent;

  dashboardData: any;

  constructor(
    private http: HttpClient,
    private renderer: Renderer2,
    private changeDetector: ChangeDetectorRef,
    private employeeFormService: EmployeeFormsService,
    private router: Router,
    private toastr: ToastrService,
    private auth: AuthService,
    private apiService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.employeeFormService
      .dashboardData()
      .pipe()
      .subscribe(
        (res: any) => {
          console.log(res);
          this.attendance = res.attendance;
          this.bonus = res.bonus;
          this.injury = res.injury;
          this.changeDetector.detectChanges();
        },
        (error) => {
          if (error.status == 401) {
            this.logout();
          }
        }
      );
    this.loadGrid();
    this.user$ = this.auth.currentUserSubject.asObservable();
    this.user$.subscribe(
      (user) => {
        if (user) {
          this.user = user;
          // if(this.user.type==6)
          // {
          //   this.router.navigate(['/forms/queue']);
          // }

          this.router.navigate(["/dashboard"]);
          this.loadDashboard();
          this.loadDashboardforManagement()
        } else {
          localStorage.setItem("returnUrl", "");
          this.logout();
        }
      },
      (error) => {
        if (error.status == 401) {
          localStorage.setItem("returnUrl", "");
          this.logout();
        }
      }
    );
  }
  loadDashboardforManagement() {
    this.apiService
      .getDashboardforManagement()
      .pipe(first())
      .subscribe(
        (data: any) => {
          if (data) {
            this.management = data.data;
            // console.log(this.dashboard)
            this.cdr.detectChanges();
          } else {
            this.toastr.error(
              "Error :" + data.message + ", Please try again after sometime.",
              "Dashboard",
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
            "Dashboard",
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
  loadDashboard() {
    this.apiService
      .getDashboard()
      .pipe(first())
      .subscribe(
        (data: any) => {
          if (data) {
            this.dashboard = data.data;
            console.log(this.dashboard)
            this.cdr.detectChanges();
          } else {
            this.toastr.error(
              "Error :" + data.message + ", Please try again after sometime.",
              "Dashboard",
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
            "Dashboard",
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
    localStorage.setItem("returnUrl", "");
    this.auth.logout();
  }

  private loadGrid() {
    let url = `${environment.apiUrl}/employee-form-grid?dT=true&escalated_list=true`;

    const that = this;
    this.dtOptions = {
      ajax: (dataTablesParameters: any, callback) => {
        that.http
          .post<DataTablesResponse>(url, dataTablesParameters, {})
          .subscribe(
            (resp: any) => {
              callback({
                recordsTotal: resp.recordsTotal,
                recordsFiltered: resp.recordsFiltered,
                data: resp.data,
              });
            },
            (error) => {
              if (error.status == 401) {
                this.logout();
              }
            }
          );
      },
      dom: 'Bfrtip',
      serverSide: true,
      processing: true,
      autoWidth: true,
      scrollCollapse: true,
      orderCellsTop: true,
      stateSave: false,
      order: [[0, "desc"]],
      columns: [
        {
          title: "ID",
          data: "id",
          visible: true,
          searchable: true,
          orderable: true,
          width: "100px",
          className: "text-muted text-center",
        },
        {
          title: "Employee Name",
          data: "employee_first_name",
          visible: true,
          searchable: true,
          orderable: true,
          render: function (data: any, type: any, full: any) {
            let imageCode = "";
            if (full.image == "" || full.image == null) {
              imageCode =
                '<span class="symbol-label fs-2 bg-light-primary text-primary rounded-circle"> ' +
                data.charAt(0).toUpperCase() +
                "</span>";
            } else {
              imageCode =
                '<img src="' + full.image + '" class="mh-50px me-3" alt=""/>';
            }
            return (
              '<div class="d-flex align-items-center mb-7">' +
              '<div class="symbol symbol-50px me-5">' +
              imageCode +
              '</div><div class="flex-grow-1">' +
              '<a href="/employees/view/' +
              full.employee_id +
              '" class="text-dark fs-6 force-wrap"> ' +
              data +
              " " +
              full.employee_last_name +
              " </a>" +
              "</div>" +
              "</div>"
            );
          },
        },
        {
          title: "Form Type",
          data: "form_type_text",
          visible: true,
          searchable: false,
          orderable: true,
        },
        {
          title: "Date",
          data: "created_at",
          visible: true,
          searchable: true,
          orderable: true,
          render: function (data: any, type: any, full: any) {
            return moment(data).format("ll");
          },
        },
        {
          title: "Status",
          data: "status",
          visible: true,
          searchable: true,
          orderable: true,
          render: function (data: any, type: any, full: any) {
            const status = parseInt(data);
            //console.log(status);
            if (status === 0) {
              // pending
              return '<span class="badge badge-light-danger">Pending</span>';
            } else if (status === 1) {
              // in progress
              return '<span class="badge badge-light-warning">In Progress</span>';
            } else if (status === 2) {
              // in review
              return '<span class="badge badge-light-warning">In Review</span>';
            } else if (status === 3) {
              // approved
              return '<span class="badge badge-light-success">Approved</span>';
            } else if (status === 4) {
              // Completed
              return '<span class="badge badge-light-success">Completed</span>';
            } else if (status === 5) {
              // Completed
              return '<span class="badge badge-light-primary">OK to close</span>';
            } else if (status === 6) {
              // Completed
              return '<span class="badge badge-light">Archived</span>';
            } else if (status === 7) {
              // Completed
              return '<span class="badge badge-light-warning">In Ops</span>';
            } else return '"' + status + '"';
          },
        },
        {
          title: "Action",
          data: "action",
          visible: true,
          searchable: false,
          width: "200px",
          className: "text-center",
          orderable: false,
          render: function (data: any, type: any, full: any) {
            return (
              '<button  title="View Form" action="employee_form_view" data-id="' +
              full.id +
              '" data-type="' +
              full.form_type +
              '"  class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1">' +
              '<span class="svg-icon svg-icon-3">' +
              '<img width="16" height="16"  action="employee_form_view" data-id="' +
              full.id +
              '" data-type="' +
              full.form_type +
              '" ' +
              'src="./assets/media/icons/tutopia/eye-open.svg"></span></button>' +
              '<button  title="Sign Form" action="employee_form_view" data-id="' +
              full.id +
              '"  data-type="' +
              full.form_type +
              '" class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1">' +
              '<span class="svg-icon svg-icon-3">' +
              '<img width="16" height="16"  action="employee_form_view" data-id="' +
              full.id +
              '" data-type="' +
              full.form_type +
              '" ' +
              'src="./assets/media/icons/duotune/art/art005.svg"></span></button>' +
              '<button  title="Resend Form" action="employee_form_edit" data-id="' +
              full.id +
              '" data-type="' +
              full.form_type +
              '" class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1">' +
              '<span class="svg-icon svg-icon-3">' +
              '<img width="16" height="16"  action="employee_form_edit" data-id="' +
              full.id +
              '" data-type="' +
              full.form_type +
              '"' +
              'src="./assets/media/icons/duotune/communication/com011.svg"></span></button>'
            );
          },
        },
        {
          title: "Manager",
          data: "manager_id",
          visible: false,
          searchable: true,
        },
        {
          title: "Form Type",
          data: "form_type",
          visible: false,
          searchable: true,
        },
      ],
    };
  }
  refreshGrid() {
    this.selectedForm = 0;
    DrawerComponent.hideAll();
    try {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        // Destroy the table first
        //console.log(dtInstance);
        //dtInstance.destroy();
        dtInstance.ajax.reload();
        // Call the dtTrigger to rerender again
        // this.dtTrigger.next(this.dtOptions);
      });
    } catch (err) {}
  }
  ngAfterViewInit(): void {
    window.setTimeout(() => {
      let base = $("#queue_table").find("thead").find("tr");
      base.addClass("fw-bolder text-muted bg-light");
      base.find("th:first-child").addClass("ps-4 rounded-start");
      base.find("th:last-child").addClass("rounded-end");
      let length_name = $("div.dataTables_length").attr("id");

      // $("#"+length_id).addClass("resetLength form-select form-select-solid");
      $('[name="' + length_name + '"]').addClass(
        "resetLength form-select form-select-solid bg-light"
      );
      $("div.dataTables_filter")
        .find("input")
        .addClass("resetLength form-control form-control-solid bg-light");
    }, 100);

    this.renderer.listen("document", "click", (event) => {
      console.log(event.target);
      const element = event.target;
      if (
        element.hasAttribute("data-id") &&
        element.hasAttribute("action") &&
        element.hasAttribute("data-type")
      ) {
        this.onAction(
          element.getAttribute("data-id"),
          element.getAttribute("action"),
          element.getAttribute("data-type")
        );
      }
    });
  }
  private onAction(id: string, action: string, type: string): void {
    //alert("clicked:"+id+", action:"+action);
    this.selectedForm = parseInt(id);
    this.changeDetector.markForCheck();
    let formType = parseInt(type);
    switch (action) {
      case "employee_form_view": {
        // route to employee/edit/:id
        if (formType === 1)
          this.router.navigate(["/forms/attendance/view/" + this.selectedForm]);
        else if (formType === 2)
          this.router.navigate(["/forms/bonus/view/" + this.selectedForm]);
        else if (formType === 3)
          this.router.navigate(["/forms/injury/view/" + this.selectedForm]);

        break;
      }
      case "employee_form_edit": {
        if (formType === 1)
          this.router.navigate(["/forms/attendance/edit/" + this.selectedForm]);
        else if (formType === 2)
          this.router.navigate(["/forms/bonus/edit/" + this.selectedForm]);
        else if (formType === 3)
          this.router.navigate(["/forms/injury/edit/" + this.selectedForm]);

        break;
      }
      default: {
        //statements;
        break;
      }
    }
  }

  // async openModal() {
  //   return await this.modalComponent.open();
  // }
}
