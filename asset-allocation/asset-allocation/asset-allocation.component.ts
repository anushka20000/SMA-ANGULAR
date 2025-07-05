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
import {DemoServiceService} from "../../../services/demo-service.service";
import {environment} from "../../../../environments/environment";
import {DataTablesResponse} from "../../../modules/DataTables/DataTablesResponse";
import {DrawerComponent, DrawerStore} from "../../../_metronic/kt/components";
import {debounceTime, first} from "rxjs/operators";
import { SchoolService } from 'src/app/services/schoolnet/school.service';


//TODO Copy this
export type action = {
  id: string,
  action:string,
  extra:string
};
//TODO Copy this

@Component({
  selector: 'app-asset-allocation',
  templateUrl: './asset-allocation.component.html',
  styleUrls: ['./asset-allocation.component.scss']
})
export class AssetAllocationComponent implements OnInit,OnDestroy{
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
  selectedSchool: number = 0;
  schoolName: string = '';
  schoolId: number = 0;

  public commonEntityName: string = 'Asset Allocation';
  public commonEntityNameAttribute: string = '';
  public commonEntityNameTable: string = '';

  private buttonClicked = new Subject<action>();
  private clickSubscription:Subscription;

  user$: Observable<UserType>;
  user:User;
  private unsubscribe: Subscription[] = [];

  public id: number=0;
  public isLoading: boolean

  public viewDetailModalStyle:string='none';

  constructor(private http: HttpClient, private renderer: Renderer2,
              private changeDetector: ChangeDetectorRef, private route: ActivatedRoute,
              private router: Router, private toastr: ToastrService,
              //TODO change to your own service
              private apiService: SchoolService,
              private auth: AuthService,
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

  private loadGrid() {
    //TODO change to your own grid URL
    let url = `${environment.apiUrl}/school-asset`;
    //alert(url);

    const that = this;
    this.dtOptions = {
      ajax: (dataTablesParameters: any, callback) => {
        that.http
            .post<DataTablesResponse>(
                url,
                dataTablesParameters, {}
            ).subscribe(resp => {
          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsFiltered,
            data: resp.data
          });
        },error => {
          if(error.status == 401)
          {
            this.logout();
          }
        });
      },
      dom: 'Bfrtip',
      serverSide: true,
      processing: true,
      autoWidth: true,
      scrollCollapse: true,
      orderCellsTop: true,
      stateSave: true,
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
          title: 'Name',
          data: 'name',
          visible: true,
          searchable: true,
          orderable: true,
          width: "100px",
          className: "text-muted text-center",
          render: function (data: any, type: any, full: any) {
            return `<span class="semidarkText fs-3 fw-semibold">`+ data + `</span>
                        <br>
                        <span>` + (full.school_type == 1 ? 'Elementary': full.school_type == 2 ? 'Secondary' : 'other' )+`</span>`
          }
        },
        
        {
          title: 'Service Engineer',
          data: 'service_engineer',
          visible: true,
          searchable: true,
          orderable: true,
          width: "100px",
          className: "text-muted text-center",
          render: function (data: any, type: any, full: any) {
            return '<span class="semidarkText fs-3 fw-semibold">'+data+'</span>'+
            '<br>'+
            '<span>'+full.phone+ '</span>'
          }

        },
        {
          title: 'UDISE Code',
          data: 'UDISE_code',
          visible: true,
          searchable: true,
          orderable: true,
          width: "100px",
          className: "text-muted text-center"

        },
        

        {
          title: 'Action',
          data: 'action',
          visible: true,
          searchable: false,
          width: "250px",
          className: "text-center",
          orderable: false,
          render: function (data: any, type: any, full: any) {
            return '<button  title="Edit '+that.commonEntityName+'" action="'+that.commonEntityNameAttribute+'_school" data-id="' + full.school_id + '"  class="btn btn-secondary btn-sm me-1"> View Asset Details</button>'+
        '<a class="btn btn-sm btn-primary" data-id="' + full.name+ "/"+ full.school_id + '" action="'+that.commonEntityNameAttribute+'_new">'+
        '<span src="/assets/media/icons/schoolnet/view.svg" class="svg-icon svg-icon-3"></span>'+
        'New Asset'+
    '</a>'
          }
        }],
    };
  }

  refreshGrid() {
    this.selectedSchool = 0;
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
    // console.log(id)
    this.selectedSchool = parseInt(id);
    const partOne = id.split("/")[0]
    const partTwo = id.split("/")[1]

    this.schoolName = String(partOne);
    this.schoolId = parseInt(partTwo)
    
    this.changeDetector.detectChanges();
 console.log(partTwo)
    //TODO rename according to your actions
    switch (action) {
      case this.commonEntityNameAttribute+"_school": {
        this.router.navigate(['/asset-allocations/details',this.selectedSchool ])
    
        break;
      }

      case this.commonEntityNameAttribute+"_new": {
        this.router.navigate(['/asset-allocations/new-asset', this.schoolName, this.schoolId ])
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

    this.loadGrid();

    this.user$ = this.auth.currentUserSubject.asObservable();
    this.user$.subscribe(user => {
      if(user)
      {
        this.user = user;
        //console.log(user);
      }
      else
      {
        this.logout();
      }
    })
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
    if(confirm("Are you sure you want to delete this "+this.commonEntityName+"?")) {

      this.apiService.delete(this.selectedSchool)
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
