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
import { AttendancesService } from "src/app/services/schoolnet/attendance.service";
//TODO Copy this
export type action = {
  id: string;
  action: string;
  extra: string;
};
//TODO Copy this

@Component({
  selector: "app-grievance",
  templateUrl: "./attendances.component.html",
  styleUrls: ["./attendances.component.scss"],
})
export class AttendancesComponent implements OnInit, OnDestroy {
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
  public commonEntityName: any = "Attendances";
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
    private modelService: AttendancesService,
    private auth: AuthService
  ) {
    this.commonEntityNameAttribute = this.commonEntityName
      .toLowerCase()
      .replace(/\s/g, "_")
      .toLowerCase();
    this.commonEntityNameTable = this.commonEntityNameAttribute + "_table";
   
  }

  ngOnDestroy(): void {
    
    if (this.clickSubscription) {
      this.clickSubscription.unsubscribe();
    }

    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
  ngOnInit(): void {
    const buttonClickedDebounced = this.buttonClicked.pipe(debounceTime(500));
    this.clickSubscription = buttonClickedDebounced.subscribe((actionDetails) =>
  
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
 
  
 
  public filteredData: any;
  private loadGrid() {
    //TODO change to your own grid URL
    let url = `${environment.apiUrl}/attendance-list`;
    //alert(url);

    const that = this;
    this.dtOptions = {
      ajax: (dataTablesParameters: any, callback) => {
        
        const data={...dataTablesParameters, project: this.project, from: this.fromDate,
          to: this.toDate, status: this.status}
        that.http
            .post<DataTablesResponse>(
                url,
                data, {}
            ).subscribe((resp:any) => {
              if(resp?.data?.length > 0){

                callback({
                  recordsTotal: resp.recordsTotal,
                  recordsFiltered: resp.recordsFiltered,
                  data: resp.data,
                  
                });
                this.filteredData = resp?.excel?.length > 0 ? resp.excel : []
                // this.cdr.detectChanges()
              
                this.changeDetector.detectChanges()
              }else{
              
                callback({
                  recordsTotal: 0,
                  recordsFiltered: 0,
                  data: [],
                });
                this.changeDetector.detectChanges()

              }
        },error => {
          if(error.status == 401)
          {
            this.logout();
          }
        });
      },
      dom: "<'row mb-2  mx-0 p-0'<'col-sm-2'><'col-sm-10'f>>" +
          "<'row mx-0 mb-2 p-0'<'col-sm-12 m-0 p-0'tr>>" +
          "<'row mx-0 mb-2 p-0 p-0'<'col-sm-2 mt-n5'l><'col-sm-4'i><'col-sm-6'p>>",
      serverSide: true,
      processing: true,
      autoWidth: true,
      scrollCollapse: true,
      orderCellsTop: true,
      stateSave: false,

      order: [[0, 'desc']],
      //TODO change according to your column


      columns: [
        {
          title: 'ID',
          data: 'id',
          visible: false,
          searchable: true,
          orderable: true,
          width: "50px",
          className: "text-muted text-center"

        },
        {
          title: 'Date',
          data: 'date',
          visible: true,
          searchable: true,
          orderable: true,
          width: "70px",
          className: "text-center text-dark fw-bold temp",
          render: function (data: any, type: any, full: any) {
            return (full.tag == "Regular Visit" ? `<span class="fw-normal text-primary">`+ data + `</span>
                        <br/>
                        <div class="badge badge-light-success">`+
                        full.tag +
                    `</div>`:`<span class="fw-normal text-primary">`+ data + `</span>
                    <br/>
                    <div class="badge badge-light-danger">`+
                    full.tag +
                `</div>`)
          }
        },
     
        {
          title: 'Name',
          data: 'name',
          visible: true,
          searchable: true,
          orderable: true,
          width: "700px",
          className: "text-center text-dark fw-bold temp",
          render: function (data: any, type: any, full: any) {

            let rgx = new RegExp(/(\p{L}{1})\p{L}+/, 'gu');

            let initials = [...data.matchAll(rgx)] || [];

            initials = (
                (initials.shift()?.[1] || '') + (initials.pop()?.[1] || '')
            ).toUpperCase();


            if(full.photo!='' && full.photo!=null)
            return `<a href="${environment.url}${full.photo}" target="_blank"><div class="symbol symbol-50px me-2 mb-2">
                <img src="${environment.url}${full.photo}" alt="">
                </div></a> ${data}`
            else
              return   `<div class="symbol symbol-50px me-2 mb-2"><span class="symbol-label fw-bold bg-primary text-inverse-warning"
                  >${initials}</span></div>${data}`;

          }



         
        },
        {
          title: 'School Name',
          data: 'school_name',
          visible: true,
          searchable: true,
          orderable: true,
          width: "140px",
          className: "text-center text-dark fw-bold temp",
          
        },
        {
          title: 'Arrival',
          data: 'check_in',
          visible: true,
          searchable: true,
          orderable: true,
          width: "100px",
          className: "text-center text-dark fw-bold temp",
          
        },
       
        
        {
          title: 'Departure',
          data: 'check_out',
          visible: true,
          searchable: true,
          orderable: true,
          width: "100px",
          className: "text-center text-dark fw-bold temp",
          

        },
        {
          title: 'Sign',
          data: 'sign',
          visible: true,
          searchable: true,
          orderable: true,
          width: "100px",
          className: "text-center text-dark fw-bold temp",
          render: function (data: any, type: any, full: any) {
            return data != null ?`
                <div class="bg-white">
                <a href="${data}">
                    <img src="${environment.url}/${data}" alt="" class="img-fluid">
                </a>
                </div>`:'';
        }

        },
        {
          title: 'File',
          data: 'file',
          visible: true,
          searchable: true,
          orderable: true,
          width: "100px",
          className: "text-center text-dark fw-bold temp",
          render: function (data: any, type: any, full: any) {
            return data != null ?`
                <a href="${environment.url}/${data}" download class="btn btn-primary btn-sm" title="Download Sign">
                    <i class="fas fa-download"></i> Download
                </a>`:'';
        }

        },
        {
          title: 'Status',
          data: 'status',
          visible: true,
          searchable: true,
          orderable: true,
          width: "100px",
          className: "text-center text-dark fw-bold temp",
          render: function (data: any, type: any, full: any) {
              return data == 1 ?'<span class="badge badge-light-success">'+  'Working Fine'+'</span>':data == 2 ?'<span class="badge badge-light-danger">'+  'Issue'+'</span>':
              data == 4 ?'<span class="badge badge-light-success">'+  'Resolved'+'</span>':data == 3 ?'<span class="badge badge-light-danger">'+  'Unresolved'+'</span>':''
            }
        },
        {
          title: 'Map',
          data: 'lat',
          visible: true,
          searchable: true,
          orderable: true,
          width: "100px",
          className: "text-center text-dark fw-bold temp",
          render: function (data: any, type: any, full: any) {
            const lat = full.lat;
            const lon = full.long;
            return `
                <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lon}" target="_blank" title="View on Google Maps">
                    <i class="fas fa-map-marker-alt" style="font-size: 24px; color: #007bff;"></i>
                </a>`;
        }
      }
      

    //     {
    //       title: 'Action',
    //       data: 'action',
    //       visible: true,
    //       searchable: false,
    //       width: "250px",
    //       className: "text-center text-dark fw-bold temp",
    //       orderable: false,
    //       render: function (data: any, type: any, full: any) {
           
    //         return '<button  title="Manage '+that.commonEntityName+'" action="'+that.commonEntityNameAttribute+'_school" data-id="' + full.id + '"  class="btn btn-secondary btn-sm me-1"> Manage Assets</button>'+
            
           
    //       ((full.type == 1 ) ? '<a class="btn btn-sm btn-primary m-1" data-id="'+ full.id + '" action="'+that.commonEntityNameAttribute+'_new">'+
    //     '<span src="/assets/media/icons/schoolnet/view.svg" class="svg-icon svg-icon-3"></span>'+
    //     'New Asset'+
    // '</a>'  + 
    // '<button  title="Edit '+that.commonEntityName+'" action="'+that.commonEntityNameAttribute+'_edit" data-id="' + full.id + '"  class="btn btn-secondary btn-sm me-1"> Edit School</button>'+
    //  '<a class="btn btn-sm btn-danger" data-id="'+ full.id + '" action="'+'school_delete"><span src="/assets/media/icons/schoolnet/view.svg" class="svg-icon svg-icon-3"></span> Delete </a>' : "" )
 
    //       }
    //     }
      ],
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
    // this.loadMap();
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

  download(){
    const data={project: this.project, from: this.fromDate,
      to: this.toDate, status: this.status}
    this.modelService
      .excel(data)
      .pipe(first())
      .subscribe(
        (data: any) => {
          if (data) {
            // console.log(data);
            this.exportToExcel(data.excel, 'exported_data.xlsx');
            // this.cdr.detectChanges();
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

// download(){

//   this.exportToExcel(this.filteredData, 'exported_data.xlsx');
// }
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
