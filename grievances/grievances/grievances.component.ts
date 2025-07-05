import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { TutopiaModalConfig } from "../../../modules/modal/TutopiaModal/modal.config";
import { TutopiaModalComponent } from "../../../modules/modal/TutopiaModal/modal.component";
import { DataTableDirective } from "angular-datatables";
import { Observable, Subject, Subscription } from "rxjs";
import { AuthService, UserType } from "../../../modules/auth";
import { User } from "../../../modules/auth/models/AuthResponse";
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { DemoServiceService } from "../../../services/demo-service.service";
import { environment } from "../../../../environments/environment";
import { DataTablesResponse } from "../../../modules/DataTables/DataTablesResponse";
import { DrawerComponent, DrawerStore } from "../../../_metronic/kt/components";
import { debounceTime, first } from "rxjs/operators";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { GrievanceService } from "src/app/services/schoolnet/grievance.service";
//TODO Copy this
export type action = {
  id: string;
  action: string;
  extra: string;
};
//TODO Copy this

@Component({
  selector: "app-grievance",
  templateUrl: "./grievances.component.html",
  styleUrls: ["./grievances.component.scss"],
})
export class GrievancesComponent implements OnInit, OnDestroy {
  modalConfig: TutopiaModalConfig = {
    modalTitle: "Modal title",
    dismissButtonLabel: "Submit",
    closeButtonLabel: "Cancel",
    isOpen: false,
  };
  @ViewChild("modal_window") private modalComponent: TutopiaModalComponent;
  modalBody = "";
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  //TODO refactor and rename according to current entity
  selectedNewsLetter: number = 0;
  public commonEntityName: any = "Grievances";
  public commonEntityNameAttribute: any = "";
  public commonEntityNameTable: string = "";
  public selectedGrievnace: any;
  private buttonClicked = new Subject<action>();
  private clickSubscription: Subscription;
  user$: Observable<UserType>;
  user: User;
  @Input() types = 0;
  private unsubscribe: Subscription[] = [];
  public ticketType = 0;
  public status: any;
  public id: number = 0;
  public projectType: any;
  public fromDate: any = null;
  public toDate: any = null;
  public viewDetailModalStyle: string = "none";
  schoolNameColumn: any;
  constructor(
    private http: HttpClient,
    private renderer: Renderer2,
    private changeDetector: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    //TODO change to your own service
    private modelService: GrievanceService,
    private auth: AuthService
  ) {
    this.commonEntityNameAttribute = this.commonEntityName
      .toLowerCase()
      .replace(/\s/g, "_")
      .toLowerCase();
    this.commonEntityNameTable = this.commonEntityNameAttribute + "_table";
    //alert(this.commonEntityNameAttribute);
  }

  ngOnDestroy(): void {
    //throw new Error('Method not implemented.');
    if (this.clickSubscription) {
      this.clickSubscription.unsubscribe();
    }

    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
  ngOnInit(): void {
    const buttonClickedDebounced = this.buttonClicked.pipe(debounceTime(500));
    this.clickSubscription = buttonClickedDebounced.subscribe((actionDetails) =>
      //The actual action that should be performed on click
      {
        this.onAction(
          actionDetails.id,
          actionDetails.action,
          actionDetails.extra
        );
      }
    );

    this.user$ = this.auth.currentUserSubject.asObservable();
    this.user$.subscribe((user) => {
      if (user) {
        this.user = user;
      } else {
        this.logout();
      }
    });

    this.loadGrid();
  }

  coloumn: any = [
    {
      title: "ID",
      data: "id",
      visible: false,
      searchable: true,
      orderable: true,
      width: "100px",
      className: "text-center text-dark fw-bold temp",
    },
    {
      title: "District",
      data: "district",
      visible: true,
      searchable: true,
      orderable: true,
      width: "100px",
      className: "text-center text-dark fw-bold temp",
      // render: function (data: any, type: any, full: any) {
      //   return (
      //     '<span class="fw-normal text-primary">' + data + "</span>"
      //   );
      // },
    },
    {
      title: "Grievance Code",
      data: "code",
      visible: true,
      searchable: true,
      orderable: true,
      width: "100px",
      className: "text-center text-dark fw-bold temp",
      render: function (data: any, type: any, full: any) {
        return (
          '<span class="fw-normal badge badge-primary">' + data + "</span>"
        );
      },
    },

    {
      title: "Asset Name",
      data: "asset_name",
      visible: true,
      searchable: true,
      orderable: true,
      width: "100px",
      className: "text-center text-dark fw-bold temp",
      render: function (data: any, type: any, full: any) {
        return (
          '<span class="fw-normal text-primary">' +
          data +
          "</span>" +
          "<br>" +
          '<span class="fw-normal text-dark">' +
          full.asset_model +
          "</span>"
        );
      },
    },
    // {
    //   title: "Ticket Type",
    //   data: "support_type",
    //   visible: true,
    //   searchable: true,
    //   orderable: true,
    //   width: "100px",
    //   className: "text-center text-dark fw-bold temp",
    //   render: function (data: any, type: any, full: any) {
    //     return (

    //       '<span class="fw-normal text-dark">' +
    //       data +
    //       "</span>"

    //     );
    //   },
    // },
    {
      title: "Raised By",
      data: "raised_by",
      visible: true,
      searchable: true,
      orderable: true,
      width: "100px",
      className: "text-center text-dark fw-bold temp",
      render: function (data: any, type: any, full: any) {
        return '<span class="fw-normal text-muted">' + data
          ? data
          : null + "</span>";
      },
    },
    {
      title: "Status",
      data: "status",
      visible: true,
      searchable: true,
      orderable: true,
      width: "100px",
      className: "text-center text-dark fw-bold temp",
      render: function (data: any, type: any, full: any) {
        return data == "Unassigned" || data == "Unresolved"
          ? '<span class="fw-normal badge badge-light-danger">' +
              data +
              "</span>"
          : data == "Completed"
          ? '<span class="fw-normal  badge badge-light-success">' +
            data +
            "</span>"
            
          : data == "Assigned" || data == "Assigned OEM"
          ? '<span class="fw-normal  badge badge-light-primary">' +
            data +
            "</span>"
          : '<span class="fw-normal  badge badge-light-warning">' +
            data +
            "</span>";
      },
    },
    {
      title: "Action",
      data: "action",
      visible: true,
      searchable: false,
      width: "250px",
      className: "text-center text-dark fw-bold temp",
      orderable: false,
      render: function (data: any, type: any, full: any) {
        return (
          '<button  title="Edit ' +
          "Grievances" +
          '" action="' +
          "grievances" +
          '_grievance" data-id="' +
          full.id +
          '"  class="btn btn-secondary btn-sm me-1"> View Details</button>'
          +
           (full.type == 1 ? '<a class="btn btn-sm btn-danger" data-id="'+ full.id + '" action="'+'grievance_delete"><span src="/assets/media/icons/schoolnet/view.svg" class="svg-icon svg-icon-3"></span> Delete </a>' : "" )
  )
        
      },
    },
  ];

  public filteredData: any;
  private loadGrid() {
    //TODO change to your own grid URL
    let url = `${environment.apiUrl}/grievance`;
    if (this.user.type !== 3) {
      this.schoolNameColumn = {
        title: "School Name",
        data: "school_name",
        visible: true,
        searchable: true,
        orderable: true,
        width: "100px",
        className: "text-center text-dark fw-bold temp",
        render: function (data: any, type: any, full: any) {
          return full.type != 3
            ? `<span class="fs-6 text-muted">` +
                data +
                `</span>
                        <br>
                        <span class="fs-6 text-muted">` +
                (full.school_type == 1
                  ? "Elementary"
                  : full.school_type == 2
                  ? "Secondary"
                  : "other") +
                `</span>`
                +
                `<br>
                        <span class="fw-normal text-primary">` +
                full.school_code  +
                `</span>`
            : "";
        },
      };
      this.coloumn.splice(1, 0, this.schoolNameColumn);
    }
    const that = this;
    this.dtOptions = {
      ajax: (dataTablesParameters: any, callback) => {
        if (this.types != 1) {
          const requestData = {
            type: 0,
            from: this.fromDate,
            to: this.toDate,
            ticketType: this.ticketType,
            status: this.status,
            project: this.project,
            ...dataTablesParameters, // merge DataTables parameters
          };
          that.http.post<DataTablesResponse>(url, requestData).subscribe(
            (resp: any) => {
              if (resp?.data?.length > 0) {
                callback({
                  recordsTotal: resp.recordsTotal,
                  recordsFiltered: resp.recordsFiltered,
                  data: resp.data,
                });
                this.filteredData = resp.excel;
                this.changeDetector.detectChanges();
              } else {
                this.filteredData = resp.excel.length > 0 ? resp.excel : [];
                callback({
                  recordsTotal: 0,
                  recordsFiltered: 0,
                  data: [],
                });
                this.changeDetector.detectChanges();
              }
            },
            (error) => {
              if (error.status == 401) {
                this.logout();
              }
            }
          );
        } else {
          const requestData = {
            type: 1,
            ticketType: this.ticketType,
            status: this.status,
            ...dataTablesParameters, // merge DataTables parameters
          };
          that.http.post<DataTablesResponse>(url, requestData).subscribe(
            (resp: any) => {
              if (resp?.data?.length > 0) {
                callback({
                  recordsTotal: resp.recordsTotal,
                  recordsFiltered: resp.recordsFiltered,
                  data: resp.data,
                });
                this.filteredData = resp.excel;
                this.changeDetector.detectChanges();
              } else {
                this.filteredData = resp.excel.length > 0 ? resp.excel : [];
                callback({
                  recordsTotal: 0,
                  recordsFiltered: 0,
                  data: [],
                });
                this.changeDetector.detectChanges();
              }
            },
            (error) => {
              if (error.status == 401) {
                this.logout();
              }
            }
          );
        }
      },
      dom:
        "<'row mb-2  mx-0 p-0'<'col-sm-2'><'col-sm-10'f>>" +
        "<'row mx-0 mb-2 p-0'<'col-sm-12 m-0 p-0'tr>>" +
        "<'row mx-0 mb-2 p-0 p-0'<'col-sm-2 mt-n5'l><'col-sm-4'i><'col-sm-6'p>>",
      serverSide: true,
      processing: true,
      autoWidth: true,
      scrollCollapse: true,
      orderCellsTop: true,
      stateSave: true,
      order: [[0, "desc"]],

      //TODO change according to your column

      columns: this.coloumn,
    };
  }
  refreshGrid() {
    this.selectedNewsLetter = 0;
    DrawerComponent.hideAll();
    try {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        // Destroy the table first
        console.log(dtInstance);
        //dtInstance.destroy();
        dtInstance.ajax.reload();
        // Call the dtTrigger to rerender again
        // this.dtTrigger.next(this.dtOptions);
      });
    } catch (err) {}
  }

  private showDrawer(name: string) {
    console.log(DrawerStore.getAllInstances());
    if (DrawerStore.has(name)) {
      DrawerComponent.hideAll();
      const instance = DrawerStore.get(name);
      instance?.show();
    }
  }
  handleDateSearch(e: any) {
    this.refreshGrid();
  }
  clearDate() {
    this.fromDate = null;
    this.toDate = null;
    this.refreshGrid();
  }
  private onAction(id: string, action: string, extra: string): void {
    this.selectedNewsLetter = parseInt(id);
    this.selectedGrievnace = parseInt(id);
    switch (action) {
      case this.commonEntityNameAttribute + "_grievance": {
        this.router.navigate([
          "/grievances/manage/details",
          this.selectedGrievnace,
        ]);
        break;
      }
      case "grievance_delete": {
        this.deleteEntity();
        break;
      }
      default: {
        //statements;
        break;
      }
    }
  }

  logout() {
    this.auth.logout();
  }

  openModal(modalId: number) {
    if (modalId == 1) {
      this.viewDetailModalStyle = "block";
    }
  }
  closePopup() {
    this.viewDetailModalStyle = "none";
  }

  ngAfterViewInit(): void {
    window.setTimeout(() => {
      //TODO change according to your table id
      let base = $("#" + this.commonEntityNameTable)
        .find("thead")
        .find("tr");
      base.addClass("fw-bolder text-muted bg-light");
      base.find("th:first-child").addClass("ps-4 rounded-start");
      base.find("th:last-child").addClass("rounded-end");
      let length_name = $("div.dataTables_length").attr("id");
      console.log(length_name);
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
      if (element.hasAttribute("data-id") && element.hasAttribute("action")) {
        this.buttonClicked.next({
          id: element.getAttribute("data-id"),
          action: element.getAttribute("action"),
          extra: element.getAttribute("data-extra"),
        });
      }
    });
  }

  //TODO rename according to your entity


  onTypeChange(e: any) {
    this.ticketType = e.target.value;
    this.refreshGrid();
  }
  onStatusChange(e: any) {
    this.status = e.target.value;
    this.refreshGrid();
  }

  exportToExcel(data: any[], fileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ["data"],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, fileName);
  }

  download() {
    this.exportToExcel(this.filteredData, "exported_data.xlsx");
  }
  public project: any;
  onProjectTypeChange(e: any) {
    this.project = e.target.value;
    this.refreshGrid();
  }
  deleteEntity()
  {
    if(confirm("Are you sure you want to delete this "+this.commonEntityName+"?")) {

      this.modelService.delete(this.selectedNewsLetter)
          .pipe(first())
          .subscribe(
              data => {
                console.log(data);
                if (data.success == true) {
                  this.toastr.success(this.commonEntityName+" deleted successfully", 'Delete '+this.commonEntityName.toLowerCase(), {
                    timeOut: 3000,
                    progressBar: true,
                    tapToDismiss: true,
                    toastClass: 'flat-toast ngx-toastr'
                  });
                  this.refreshGrid();
                } else {
                  this.toastr.error('Error:' + data.message + ', Please try again after sometime.', 'Delete '+this.commonEntityName, {
                    timeOut: 3000,
                    progressBar: true,
                    tapToDismiss: true,
                    toastClass: 'flat-toast ngx-toastr'
                  });
                }
              },
              error => {
                this.toastr.error('Error:' + error.toString(), 'Delete '+this.commonEntityName, {
                  timeOut: 3000,
                  progressBar: true,
                  tapToDismiss: true,
                  toastClass: 'flat-toast ngx-toastr'
                });
              });
// code here
    }


  }
}
