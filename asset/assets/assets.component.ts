import {ChangeDetectorRef, Component, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {TutopiaModalConfig} from "../../../modules/modal/TutopiaModal/modal.config";
import {TutopiaModalComponent} from "../../../modules/modal/TutopiaModal/modal.component";
import {DataTableDirective} from "angular-datatables";
import {Observable, Subject, Subscription} from "rxjs";
import {AuthService, UserType} from "../../../modules/auth";
import {User} from "../../../modules/auth/models/AuthResponse";
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {environment} from "../../../../environments/environment";
import {DataTablesResponse} from "../../../modules/DataTables/DataTablesResponse";
import {DrawerComponent, DrawerStore} from "../../../_metronic/kt/components";
import {debounceTime, first} from "rxjs/operators";
import {DemoServiceService} from "../../../services/demo-service.service";
import * as moment from 'moment';
import { AssetsService } from 'src/app/services/schoolnet/assets.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

//TODO Copy this
export type action = {
  id: string,
  action:string,
  extra:string
};
//TODO Copy this


@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss']
})





export class AssetsComponent implements OnInit,OnDestroy{
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
  public commonEntityName: string = 'Asset';
  public commonEntityNameAttribute: string = '';
  public commonEntityNameTable: string = '';

  private buttonClicked = new Subject<action>();
  private clickSubscription:Subscription;

  user$: Observable<UserType>;
  user:User;
  private unsubscribe: Subscription[] = [];

  public id: number=0;
  public obj: any;
  public addAssetModalStyle:string='none';
  public addBulkAssetModalStyle:string='none';
  public tab: any = 0;
  public project=0;
  public categoryList:any;
  public categoryId:any=0;
  constructor(private http: HttpClient, private renderer: Renderer2,
              private changeDetector: ChangeDetectorRef, private route: ActivatedRoute,
              private router: Router, private toastr: ToastrService,
              //TODO change to your own service
              private modelService: AssetsService,
              private auth: AuthService,
    private cdr: ChangeDetectorRef,

  ) {

    this.commonEntityNameAttribute= this.commonEntityName.toLowerCase().replace(/\s/g, '_').toLowerCase();
    this.commonEntityNameTable= this.commonEntityNameAttribute+'_table';
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
  private loadGrid(type: any) {
    // console.log(type)
    //TODO change to your own grid URL
    if(type == 1){
      // console.log('1',this.id)
      let url = `${environment.apiUrl}/asset`;
      this.tab = 1;
      const that = this;
      this.dtOptions = {
        ajax: (dataTablesParameters: any, callback) => {
          dataTablesParameters.school_id = this.id;
          const data={
            ...dataTablesParameters,
            project: this.project,
            categoryId: this.categoryId
          }
          that.http
              .post<DataTablesResponse>(
                  url,
                  data,
              ).subscribe((resp:any) => {
                if(resp?.data?.length >0){

                  callback({
                    recordsTotal: resp.recordsTotal,
                    recordsFiltered: resp.recordsFiltered,
                    data: resp.data
                  });
                  // this.filteredData = resp.excel
                  this.cdr.detectChanges()
                }else{
                  // this.filteredData = resp.excel.length > 0 ? resp.excel : []
                  callback({
                    recordsTotal: 0,
                    recordsFiltered: 0,
                    data: []
                  });
                  this.cdr.detectChanges()
                }
          },error => {
            if(error.status == 401)
            {
              this.logout();
            }
          });
        },
        dom: "<'row mx-0 p-0 mb-2 p-0'<'col-sm-6'><'col-sm-6 text-end'f>>" +
        "<'row mx-0 mb-2 p-0'<'col-sm-12 m-0 p-0'tr>>" +
        "<'row  mx-0 p-0'<'col-sm-2 mt-n5'l><'col-sm-4'i><'col-sm-6'p>>",
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
            width: "100px",
            className: "text-muted text-center"
  
          },
          {
            title: 'Added On',
            data: 'added_on',
            visible: true,
            searchable: true,
            orderable: true,
            width: "100px",
            className: "text-start text-dark fw-bold temp",
            render: function (data: any, type: any, full: any) {
              return '<span class="text-start fw-normal text-muted">'+
                  moment(data).format('ll')
                  +'</span>';
            }
          },
          {
            title: 'Project Type',
            data: 'project',
            visible: true,
            searchable: true,
            orderable: true,
            width: "60px",
            className: "text-center text-dark fw-bold temp",
            render: function (data: any, type: any, full: any) {
              return '<span class="fw-normal badge '+ (data == 1 ? 'badge-primary"> IFP' : ' badge-success"> KYAN') +'</span>'
            }
          },
          
          {
            title: 'Asset Category',
            data: 'category',
            visible: true,
            searchable: true,
            orderable: true,
            width: "100px",
            className: "text-center text-dark fw-bold temp",
            render: function (data: any, type: any, full: any) {
              return '<span class="fw-normal text-muted">'+ data +'</span>'
            }
          },
          {
            title: 'Asset Name',
            data: 'name',
            visible: true,
            searchable: true,
            orderable: true,
            width: "100px",
            className: "text-center text-dark fw-bold temp",
            render: function (data: any, type: any, full: any) {
              return '<span class="fw-normal text-primary">'+ data +'</span>'+
                  '<br>'+
                  '<span class="fw-normal text-dark">'+ full.model +'</span>';
            }
  
          },
          {
            title: 'SL.No',
            data: 'serial_no',
            visible: true,
            searchable: true,
            orderable: true,
            width: "100px",
            className: "text-center text-dark fw-bold temp",
            render: function (data: any, type: any, full: any) {
              return '<span class="fw-normal text-dark">'+ data +'</span>'
            }
  
            
          },
          
          
          {
            title: 'Action',
            data: 'action',
            visible: (this.user.type == 1 || this.user.type == 5 ) ? true : false,
            searchable: false,
            width: "250px",
            className: "text-center text-dark fw-bold temp",
            orderable: false,
            render: function (data: any, type: any, full: any) {
              //TODO rename according to your actions
              return  '<button  title="Delete '+that.commonEntityName+'" action="'+that.commonEntityNameAttribute+'_remove" data-id="' + full.id + '"  class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1">' +
                  '<span class="svg-icon svg-icon-3">' +
                  '<img width="16" height="16" action="'+that.commonEntityNameAttribute+'_remove" data-id="' + full.id + '" ' +
                  'src="./assets/media/icons/schoolnet/trash-bin.svg"></span></button>';
  
            }
          }],
      };
    }else{
      this.obj = {
        school_id : this.id
      }
      let url = `${environment.apiUrl}/asset`;
      //alert(url);
  
      const that = this;
      this.dtOptions = {
        ajax: (dataTablesParameters: any, callback) => {
          const data={
            ...dataTablesParameters,
            project: this.project,
            categoryId: this.categoryId

          }
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
                  this.filteredData = resp.excel
                  this.cdr.detectChanges()
                }else{
                  this.filteredData = resp.excel.length > 0 ? resp.excel : []
                  callback({
                    recordsTotal: 0,
                    recordsFiltered: 0,
                    data: []
                  });
                  this.cdr.detectChanges()
                }
          },error => {
            if(error.status == 401)
            {
              this.logout();
            }
          });
        },
        dom: "<'row mx-0 p-0 mb-2 p-0'<'col-sm-6'><'col-sm-6 text-end'f>>" +
            "<'row mx-0 mb-2 p-0'<'col-sm-12 m-0 p-0'tr>>" +
            "<'row  mx-0 p-0'<'col-sm-2 mt-n5'l><'col-sm-4'i><'col-sm-6'p>>",
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
            width: "100px",
            className: "text-muted text-center"
  
          },
          {
            title: 'Added On',
            data: 'added_on',
            visible: true,
            searchable: true,
            orderable: true,
            width: "60px",
            className: "text-start text-dark fw-bold temp",
            render: function (data: any, type: any, full: any) {
              return '<span class="text-start fw-normal text-muted">'+
              moment(data).format('ll')
              +'</span>';
            }
          },
          {
            title: 'Project Type',
            data: 'project',
            visible: true,
            searchable: true,
            orderable: true,
            width: "60px",
            className: "text-center text-dark fw-bold temp",
            render: function (data: any, type: any, full: any) {
              return '<span class="fw-normal badge '+ (data == 1 ? 'badge-primary"> IFP' : ' badge-success"> KYAN') +'</span>'
            }
          },
          {
            title: 'Asset Category',
            data: 'category',
            visible: true,
            searchable: true,
            orderable: true,
            width: "100px",
            className: "text-center text-dark fw-bold temp",
            render: function (data: any, type: any, full: any) {
              return '<span class="fw-normal text-muted">'+ data +'</span>'
            }
           
          },
          {
            title: 'Asset Name',
            data: 'name',
            visible: true,
            searchable: true,
            orderable: true,
            width: "100px",
            className: "text-center text-dark fw-bold temp",
            render: function (data: any, type: any, full: any) {
              return '<span class="fw-normal text-primary">'+ data +'</span>'+
              '<br>'+
              '<span class="fw-normal text-dark">'+ full.model +'</span>';
            }
  
          },
          {
            title: 'SL.No',
            data: 'serial_no',
            visible: true,
            searchable: true,
            orderable: true,
            width: "100px",
            className: "text-center text-dark fw-bold temp",
            render: function (data: any, type: any, full: any) {
              return '<span class="fw-normal text-dark">'+ data +'</span>'
            }
            
          },
          
          
          {
            title: 'Action',
            data: 'action',
            visible: (this.user.type == 1 || this.user.type == 5 ) ? true : false,
            searchable: false,
            width: "250px",
            className: "text-center text-dark fw-bold temp",
            orderable: false,
            render: function (data: any, type: any, full: any) {
              //TODO rename according to your actions
              return '<button  title="Delete '+that.commonEntityName+'" action="'+that.commonEntityNameAttribute+'_delete" data-id="' + full.id + '"  class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1">' +
                  '<span class="svg-icon svg-icon-3">' +
                  '<img width="16" height="16" action="'+that.commonEntityNameAttribute+'_delete" data-id="' + full.id + '" ' +
                  'src="./assets/media/icons/schoolnet/trash-bin.svg"></span></button>';
  
            }
          }],
      };

    }
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
    //alert("clicked:"+id+", action:"+action);
    this.selectedNewsLetter = parseInt(id);
    this.changeDetector.detectChanges();
    //TODO rename according to your actions
    switch (action) {
      case this.commonEntityNameAttribute+"_edit": {
        this.showDrawer("edit_"+this.commonEntityName.toLowerCase().replace(/\s/g, '_')+"_drawer");
        break;
      }

      case this.commonEntityNameAttribute+"_delete": {
        this.deleteEntity();
        break;
      }
      case this.commonEntityNameAttribute+"_remove": {
        this.removeEntity();
        break;
      }
      default: {
        //statements;
        break;
      }
    }
  }


  ngOnInit(): void {
    const buttonClickedDebounced =
        this.buttonClicked.pipe(debounceTime(500));
    this.clickSubscription = buttonClickedDebounced.subscribe((actionDetails) =>
            //The actual action that should be performed on click
        {
          this.onAction(actionDetails.id, actionDetails.action,actionDetails.extra);
        }
    );


    this.user$ = this.auth.currentUserSubject.asObservable();
    this.user$.subscribe(user => {
      if(user)
      {
        this.user = user;
        //console.log(user);
        this.loadCategory()
      }
      else
      {
        this.logout();
      }
    })
    this.route.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id');
      console.log(this.user)
      if(id !=null)
      {
        this.id = +id;
        if(this.id>0)
        {
    this.loadGrid(1);
          
          
        }

      }
      else if(id == null && this.user?.school_id){
        this.id = this.user?.school_id
       
    this.loadGrid(1);

      }
      else{
        console.log(this.id)
  this.loadGrid(2);
    }});
  }

  logout() {
    this.auth.logout();
  }

  openModal(modalId:number)
  {
    if(modalId==1)
    {
      this.addAssetModalStyle='block';
    }
    if(modalId==2)
    {
      this.addBulkAssetModalStyle='block';
    }

  }
  closePopup()
  {
    this.addAssetModalStyle='none';
    this.addBulkAssetModalStyle='none';
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
  removeEntity()
  {
    if(confirm("Are you sure you want to delete this "+this.commonEntityName+"?")) {

      this.modelService.removeAssetFromSchool(this.selectedNewsLetter)
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
  public onAdded(){
    this.refreshGrid();
    this.closePopup();
  }
  
  onTypeChange(e:any){
    this.project= e.target.value;
    this.refreshGrid()
  }

  loadCategory() {
    this.modelService
      .getCategory()
      .pipe(first())
      .subscribe(
        (data: any) => {
          if (data) {
            this.categoryList = data.data;
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

  searchCategory(e:any){
    if(e == undefined){
      this.categoryId = 0;
      this.refreshGrid()
    }else{

      this.categoryId= e.id
      this.refreshGrid()
    }

  }
  exportToExcel(data: any[], fileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, fileName);
  }
  
download(){
 
    this.modelService
      .excel()
      .pipe(first())
      .subscribe(
        (data: any) => {
          if (data) {
            console.log(data);
            this.exportToExcel(data.excel, 'exported_data.xlsx');
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
}
