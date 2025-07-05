import {ChangeDetectorRef, Component, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {TutopiaModalConfig} from "../../../modules/modal/TutopiaModal/modal.config";
import {TutopiaModalComponent} from "../../../modules/modal/TutopiaModal/modal.component";
import {DataTableDirective} from "angular-datatables";
import {Observable, Subject, Subscription} from "rxjs";
import {AuthService, UserType} from "../../../modules/auth";
import {User} from "../../../modules/auth/models/AuthResponse";
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {DemoServiceService} from "../../../services/demo-service.service";
import {environment} from "../../../../environments/environment";
import {DataTablesResponse} from "../../../modules/DataTables/DataTablesResponse";
import {DrawerComponent, DrawerStore} from "../../../_metronic/kt/components";
import {debounceTime, first} from "rxjs/operators";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { SchoolService } from 'src/app/services/schoolnet/school.service';

//TODO Copy this
export type action = {
  id: string,
  action:string,
  extra:string
};
//TODO Copy this

@Component({
  selector: 'app-schools',
  templateUrl: './schools.component.html',
  styleUrls: ['./schools.component.scss']
})
export class SchoolsComponent implements OnInit,OnDestroy{
  modalConfig: TutopiaModalConfig = {
    modalTitle: 'Modal title',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel',
    isOpen: false,
  };
  @ViewChild('modal_window') private modalComponent: TutopiaModalComponent;
  modalBody = "";
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  //TODO refactor and rename according to current entity
  selectedNewsLetter: number = 0;
  // public commonEntityName: string = 'School';
  // public commonEntityNameAttribute: string = '';
  public commonEntityNameTable: string = 'School';
  selectedSchool: number = 0;

  private buttonClicked = new Subject<action>();
  private clickSubscription:Subscription;
  public schoolId: number = 0;
  public project= 2;
  public districtName= '';

  user$: Observable<UserType>;
  user:User ={} ;
  public fromDate: any = null;
  public toDate: any = null;
  private unsubscribe: Subscription[] = [];

  public id: number=0;
  public districtId: any = 0;
  public districtList: any = 0;



  public viewDetailModalStyle:string='none';

  constructor(private http: HttpClient, private renderer: Renderer2,
              private changeDetector: ChangeDetectorRef, private route: ActivatedRoute,
              private router: Router, private toastr: ToastrService,
              //TODO change to your own service
              private modelService: SchoolService,
              private auth: AuthService,
  ) {

    // this.commonEntityNameAttribute= this.commonEntityName.toLowerCase().replace(/\s/g, '_').toLowerCase();
    // this.commonEntityNameTable= this.commonEntityNameAttribute+'_table';
    //alert(this.commonEntityNameAttribute);
  }



  ngOnDestroy(): void {
    //throw new Error('Method not implemented.');
    if(this.clickSubscription) {
      this.clickSubscription.unsubscribe();
    }

    this.unsubscribe.forEach((sb) => sb.unsubscribe());

  }
public filteredData:any;
  private loadGrid() {
    if(this.user){

      //TODO change to your own grid URL
      let url = `${environment.apiUrl}/school`;
      //alert(url);
  
      const that = this;
      this.dtOptions = {
        ajax: (dataTablesParameters: any, callback) => {
          const data={...dataTablesParameters, project: this.project, district_id: this.districtId, from: this.fromDate,
            to: this.toDate}
          that.http
              .post<DataTablesResponse>(
                  url,
                  data, {}
              ).subscribe((resp:any) => {
                if(resp?.data?.length > 0){
  
                  callback({
                    recordsTotal: resp.recordsTotal,
                    recordsFiltered: resp.recordsFiltered,
                    data: resp.data
                    
                  });
                  // this.filteredData = resp.excel
                  this.changeDetector.detectChanges()
                }else{
                  // this.filteredData = resp.excel.length > 0 ? resp.excel : []
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
  
  
        columns: this.columns
      };
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
    } catch (err) {

    }
  }

  private showDrawer(name: string) {
    console.log(DrawerStore.getAllInstances());
    if (DrawerStore.has(name)) {
      DrawerComponent.hideAll();
      const instance = DrawerStore.get(name);
      instance?.show();
    }
  }

  private onAction(id: string, action: string,extra:string): void {
    this.changeDetector.detectChanges();
    this.schoolId = parseInt(id)
    //TODO rename according to your actions
    switch (action) {
      case "school_edit": {
        this.router.navigate(['/schools/edit/',this.schoolId ])
        break;
      }
      case "manage_school": {
        this.router.navigate(['/schools/details',this.schoolId ])
    
        break;
      }
      case "school_new": {
        this.router.navigate(['/schools/new-asset',this.schoolId ])
        break;
      }
   
      case "school_delete": {
        this.deleteEntity();
        break;
      }
      default: {
        //statements;
        break;
      }
    }
  }
  columns:any;



  ngOnInit(): void {
    
    this.user$ = this.auth.currentUserSubject.asObservable();
    this.user$.subscribe(user => {
      if(user)
      {
        this.user = user;
        if(user?.type == 6){
          this.route.queryParams.subscribe(params => {
            if(params['type'].length == 2){
              this.project == 1
            }else{
      
              this.project = params['type']; 
            }
          })
        }
        this.columns = user?.type == 6? [
          // {
          //   title: 'Device Id',
          //   data: 'id',
          //   visible: true,
          //   searchable: true,
          //   orderable: true,
          //   width: "100px",
          //   className: "text-muted text-center"
      
          // },
          {
            title: 'Date',
            data: 'date',
            visible: true,
            searchable: true,
            orderable: true,
            width: "100px",
            className: "text-dark text-center"
      
          },          
          {
            title: 'Name',
            data: 'name',
            visible: true,
            searchable: true,
            orderable: true,
            width: "150px",
            className: "text-center text-dark fw-bold temp",
            render: function (data: any, type: any, full: any) {
              return `<span class="fw-normal text-primary">`+ data + `</span>
                          <br/>
                          <span class="fw-normal text-muted">` + (full.school_type == 1 ? 'Elementary': full.school_type == 2 ? 'Secondary': 'other' )+`</span>`
            }
          },
          // {
          //   title: 'Contact Person',
          //   data: 'master_name',
          //   visible: true,
          //   searchable: true,
          //   orderable: true,
          //   width: "140px",
          //   className: "text-center text-dark fw-bold temp",
          //   render: function (data: any, type: any, full: any) {
          //     return '<span class="fw-normal text-dark">'+data+'</span>'+
          //     '<br/>'+
          //         (full.contact_person_designation == ""?
          //     '<span class="fw-normal text-muted">Head Master</span><br/>':"")+
          //         '<span class="fw-normal text-muted">'+ full.master_number +'</span>'
          //   }
          // },
          {
            title: 'Contact Person',
            data: 'hm_name',
            visible: true,
            searchable: true,
            orderable: true,
            width: "100px",
            className: "text-center text-dark fw-bold temp",
            render: function (data: any, type: any, full: any) {
              return '<span class="fw-normal text-dark">'+data+'</span>'
            }
          },
         
          
          {
            title: 'Contact Person Number',
            data: 'hm_number',
            visible: true,
            searchable: true,
            orderable: true,
            width: "100px",
            className: "text-center text-dark fw-bold temp",
            render: function (data: any, type: any, full: any) {
              return '<span class="fs-6 text-muted">'+ data +'</span>'
            }
      
          },
          // {
          //   title: 'Service Engineer',
          //   data: 'service_engineer',
          //   visible: true,
          //   searchable: true,
          //   orderable: true,
          //   width: "100px",
          //   className: "text-center text-dark fw-bold temp",
          //   render: function (data: any, type: any, full: any) {
          //     return '<span class="fw-normal text-dark">'+data+'</span>'+
          //     '<br>'+
          //     '<span class="fw-normal text-muted">'+full.phone+ '</span>'
          //   }
      
          // },
          // {
          //   title: 'Address',
          //   data: 'address',
          //   visible: false,
          //   searchable: true,
          //   orderable: true,
          //   width: "100px",
          //   className: "text-muted text-center"
      
          // },
          // {
          //   title: 'Pincode',
          //   data: 'pincode',
          //   visible: false,
          //   searchable: true,
          //   orderable: true,
          //   width: "100px",
          //   className: "text-dark text-center"
      
          // },
          {
            title: 'District',
            data: 'district',
            visible: true,
            searchable: true,
            orderable: true,
            width: "100px",
            className: "text-dark text-center"
      
          },
          {
            title: 'Block',
            data: 'block',
            visible: true,
            searchable: true,
            orderable: true,
            width: "100px",
            className: "text-dark text-center"
      
          },
          {
            title: 'Serial Number',
            data: 'serial_no',
            visible: true,
            searchable: true,
            orderable: true,
            width: "100px",
            className: "text-dark text-center"
      
          },
         
          {
            title: 'Active/Inactive',
            data: 'active',
            visible: true,
            searchable: true,
            orderable: true,
            width: "100px",
            className: "text-dark text-center",
            render: function (data: any, type: any, full: any) {
              return `
                          <span class="fw-normal text-bold">` + (full.active == 1 ? 'Active':  'Inactive')+`</span>`
            }
      
          },
          // {
          //   title: 'Start/End',
          //   data: 'start',
          //   visible: true,
          //   searchable: true,
          //   orderable: true,
          //   width: "100px",
          //   className: "text-dark text-center",
          //   render: function (data: any, type: any, full: any) {
          //     return `<span class="fw-normal text-bold">` + full.start + ' / ' + full.end + `</span>`
          //   }
      
          // },
          {
            title: 'Working Hours',
            data: 'diff',
            visible: true,
            searchable: true,
            orderable: true,
            width: "100px",
            className: "text-dark text-center",      
          },
          {
            title: 'Last seen',
            data: 'last_seen',
            visible: true,
            searchable: true,
            orderable: true,
            width: "100px",
            className: "text-dark text-center"
      
          },
      
          // {
          //   title: 'Action',
          //   data: 'action',
          //   visible: true,
          //   searchable: false,
          //   width: "250px",
          //   className: "text-center text-dark fw-bold temp",
          //   orderable: false,
          //   render: function (data: any, type: any, full: any) {
             
          //     return '<button  title="Manage school" action="manage_school" data-id="' + full.id + '"  class="btn btn-secondary btn-sm me-1"> View Details</button>';
      
          //   }
          // }
        ] : 
          [
            {
              title: 'ID',
              data: 'id',
              visible: false,
              searchable: true,
              orderable: true,
              width: "100px",
              className: "text-muted text-center"
        
            },
            // {
            //   title: 'Date',
            //   data: 'date',
            //   visible: true,
            //   searchable: true,
            //   orderable: true,
            //   width: "100px",
            //   className: "text-dark text-center"
        
            // },
            {
              title: 'UDISE Code',
              data: 'UDISE_code',
              visible: true,
              searchable: true,
              orderable: true,
              width: "80px",
              className: "text-dark fw-bold temp",
              render: function (data: any, type: any, full: any) {
                return '<span class="fw-normal text-dark">'+ data +'</span>'
              }
        
            },
            {
              title: 'SchoolNet Code',
              data: 'schoolnet_code',
              visible: false,
              searchable: true,
              orderable: true,
              width: "80px",
              className: "text-center text-dark fw-bold temp",
              render: function (data: any, type: any, full: any) {
                return '<span class="fw-normal text-dark">'+ data ? data : '' +'</span>'
              }
        
            },
         
            {
              title: 'Name',
              data: 'name',
              visible: true,
              searchable: true,
              orderable: true,
              width: "150px",
              className: "text-center text-dark fw-bold temp",
              render: function (data: any, type: any, full: any) {
                return `<span class="fw-normal text-primary">`+ data + `</span>
                            <br/>
                            <span class="fw-normal text-muted">` + (full.school_type == 1 ? 'Elementary': full.school_type == 2 ? 'Secondary': 'other' )+`</span>`
              }
            },
            {
              title: 'Contact Person',
              data: 'master_name',
              visible: true,
              searchable: true,
              orderable: true,
              width: "140px",
              className: "text-center text-dark fw-bold temp",
              render: function (data: any, type: any, full: any) {
                return '<span class="fw-normal text-dark">'+data+'</span>'+
                '<br/>'+
                    (full.contact_person_designation == ""?
                '<span class="fw-normal text-muted">Head Master</span><br/>':"")+
                    '<span class="fw-normal text-muted">'+ full.master_number +'</span>'
              }
            },
            {
              title: 'Contact Person',
              data: 'contact_person',
              visible: false,
              searchable: true,
              orderable: true,
              width: "100px",
              className: "text-center text-dark fw-bold temp",
              render: function (data: any, type: any, full: any) {
                return '<span class="fw-normal text-dark">'+data+'</span>'+
                '<br>'+
                '<span class="fw-normal text-muted">'+full.contact_person_designation + '</span>'
              }
            },
           
            
            {
              title: 'Contact Person Number',
              data: 'contact_person_number',
              visible: false,
              searchable: true,
              orderable: true,
              width: "100px",
              className: "text-center text-dark fw-bold temp",
              render: function (data: any, type: any, full: any) {
                return '<span class="fs-6 text-muted">'+ data +'</span>'
              }
        
            },
            {
              title: 'Service Engineer',
              data: 'service_engineer',
              visible: true,
              searchable: true,
              orderable: true,
              width: "100px",
              className: "text-center text-dark fw-bold temp",
              render: function (data: any, type: any, full: any) {
                return '<span class="fw-normal text-dark">'+data+'</span>'+
                '<br>'+
                '<span class="fw-normal text-muted">'+full.phone+ '</span>'
              }
        
            },
            {
              title: 'Address',
              data: 'address',
              visible: false,
              searchable: true,
              orderable: true,
              width: "100px",
              className: "text-muted text-center"
        
            },
            {
              title: 'Pincode',
              data: 'pincode',
              visible: false,
              searchable: true,
              orderable: true,
              width: "100px",
              className: "text-dark text-center"
        
            },
            {
              title: 'District',
              data: 'district',
              visible: true,
              searchable: true,
              orderable: true,
              width: "100px",
              className: "text-dark text-center"
        
            },
            {
              title: 'Block',
              data: 'block',
              visible: true,
              searchable: true,
              orderable: true,
              width: "100px",
              className: "text-dark text-center"
        
            },
           
            // {
            //   title: 'Active/Inactive',
            //   data: 'on_off',
            //   visible: true,
            //   searchable: true,
            //   orderable: true,
            //   width: "100px",
            //   className: "text-dark text-center"
        
            // },
            // {
            //   title: 'Start/End',
            //   data: 'last_seen',
            //   visible: true,
            //   searchable: true,
            //   orderable: true,
            //   width: "100px",
            //   className: "text-dark text-center"
        
            // },
        
            {
              title: 'Action',
              data: 'action',
              visible: true,
              searchable: false,
              width: "250px",
              className: "text-center text-dark fw-bold temp",
              orderable: false,
              render: function (data: any, type: any, full: any) {
               
                return '<button  title="Manage school" action="manage_school" data-id="' + full.id + '"  class="btn btn-secondary btn-sm me-1"> Manage Assets</button>'+
               
              ((full.type == 1 ) ? '<a class="btn btn-sm btn-primary m-1" data-id="'+ full.id + '" action="school_new">'+
            '<span src="/assets/media/icons/schoolnet/view.svg" class="svg-icon svg-icon-3"></span>'+
            'New Asset'+
        '</a>'  + 
        '<button  title="Edit school" action="school_edit" data-id="' + full.id + '"  class="btn btn-secondary btn-sm me-1"> Edit School</button>'+
         '<a class="btn btn-sm btn-danger" data-id="'+ full.id + '" action="'+'school_delete"><span src="/assets/media/icons/schoolnet/view.svg" class="svg-icon svg-icon-3"></span> Delete </a>' : "" )
        
              }
            }]
        // this.changeDetector.detectChanges()
        if(this.user){
          this.onSelectDistrict()

          this.loadGrid();
        }

        console.log(user);
      }
      else
      {
        this.logout();
      }
    })
    const buttonClickedDebounced =
    this.buttonClicked.pipe(debounceTime(500));
this.clickSubscription = buttonClickedDebounced.subscribe((actionDetails) =>
        //The actual action that should be performed on click
    {
      this.onAction(actionDetails.id, actionDetails.action,actionDetails.extra);
    }
);

  }

  logout() {
    this.auth.logout();
  }

  openModal(modalId:number)
  {
    if(modalId==1)
    {
      this.viewDetailModalStyle='block';
    }


  }
  closePopup()
  {
    this.viewDetailModalStyle='none';

  }





  ngAfterViewInit(): void {

    window.setTimeout(() => {
      //TODO change according to your table id
      let base = $("#"+this.commonEntityNameTable).find("thead").find("tr");
      base.addClass("fw-bolder text-muted bg-light");
      base.find('th:first-child').addClass("ps-4 rounded-start");
      base.find('th:last-child').addClass("rounded-end");
      let length_name = $("div.dataTables_length").attr("id");
      console.log(length_name);
      // $("#"+length_id).addClass("resetLength form-select form-select-solid");
      $('[name="' + length_name + '"]').addClass("resetLength form-select form-select-solid bg-light");
      $("div.dataTables_filter").find("input").addClass("resetLength form-control form-control-solid bg-light");


    }, 100);


    this.renderer.listen('document', 'click', (event) => {

      console.log(event.target);
      const element = event.target;
      if (element.hasAttribute("data-id") && element.hasAttribute("action")) {

        this.buttonClicked.next({
          id: element.getAttribute("data-id"),
          action: element.getAttribute("action"),
          extra: element.getAttribute("data-extra")
        });
      }
    });

  }

  //TODO rename according to your entity

  deleteEntity()
  {
    if(confirm("Are you sure you want to delete this school ?")) {

      this.modelService.delete(this.selectedNewsLetter)
          .pipe(first())
          .subscribe(
              data => {
                console.log(data);
                if (data.success == true) {
                  this.toastr.success("School deleted successfully", 'Delete school', {
                    timeOut: 3000,
                    progressBar: true,
                    tapToDismiss: true,
                    toastClass: 'flat-toast ngx-toastr'
                  });
                  this.refreshGrid();
                } else {
                  this.toastr.error('Error:' + data.message + ', Please try again after sometime.', 'Delete school', {
                    timeOut: 3000,
                    progressBar: true,
                    tapToDismiss: true,
                    toastClass: 'flat-toast ngx-toastr'
                  });
                }
              },
              error => {
                this.toastr.error('Error:' + error.toString(), 'Delete school', {
                  timeOut: 3000,
                  progressBar: true,
                  tapToDismiss: true,
                  toastClass: 'flat-toast ngx-toastr'
                });
              });
// code here
    }


  }
  onTypeChange(e:any){
    this.project= e.target.value;
    this.refreshGrid()
  }
  onDistrictSelection(e:any){
  
    if (e === undefined) {
      console.log("here")
      // Handle case where no district is selected
      this.districtId = null;
      this.refreshGrid()

    } else {
    // console.log(e.id)
    this.districtId= e.name;
    this.refreshGrid()
    }
  }
  onSelectDistrict(){
    this.districtId = null

    this.modelService.getDistrict()
      .pipe(first())
      .subscribe(
        data => {
          if (data) {
              this.districtList = data.data;
              this.changeDetector.detectChanges();
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
  exportToExcel(data: any[], fileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, fileName);
  }

  download(){
    const data={project: this.project,district_id: this.districtId, to: this.toDate, from: this.fromDate }
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
}
