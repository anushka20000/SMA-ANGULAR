import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
import {
  generateUniqueName,
  getCDNImage,
  getPrefix,
} from "../../../modules/utilities/file";
import { UploadService } from "../../../services/upload.service";
import { Router } from "@angular/router";
import { FormBuilder } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "../../../modules/auth";
import { AssetsService } from "src/app/services/schoolnet/assets.service";
import { catchError, first } from "rxjs/operators";
import { BehaviorSubject, Subscription } from "rxjs";
import { DataTableDirective } from "angular-datatables";
import { DrawerComponent } from "src/app/_metronic/kt/components";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from "src/environments/environment";
@Component({
  selector: "app-add-bulk-asset",
  templateUrl: "./add-bulk-asset.component.html",
  styleUrls: ["./add-bulk-asset.component.scss"],
})
export class AddBulkAssetComponent {
  selectedFile: File | null = null;
  @Output() OnAddForm = new EventEmitter<any>();
  @Input() type:any;
  //TODO for pdf upload
  public pdfFile?: any;
  public pdfProgress: number = 0;
  public pdf_path = "";
  dtElement: DataTableDirective;
  selectedNewsLetter: number = 0;
  //TODO End
  private unsubscribe: Subscription[] = [];
  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private auth: AuthService,
    private http: HttpClient,
    private apiService: AssetsService
  ) {
    const loadingSubscr = this.isLoading$
      .asObservable()
      .subscribe((res) => (this.isLoading = res));
    this.unsubscribe.push(loadingSubscr);
  }
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading: boolean;
  onProgress(event: any) {
    let progress = (event.loaded * 100) / event.total;
    if (progress > 100) progress = 100;
    //Todo For showing different progress bar for different file upload
    // switch (type) {

    //     case 1: {
    //         this.pdfProgress = Math.round(progress);
    //         break;
    //     }
    //     default: {
    //         console.log(progress)
    //         break;
    //     }
    // }
  }

  onRemovePdf(event:any)
  {
      delete this.pdfFile;
      this.pdfProgress=0;
  }
  logout() {
    this.auth.logout();
  }
  // private handleUpload(file:File,type:number)
  // {
  //   if(file)
  //   {
  //     const fileName = file.name;
  //     console.log(file)
  //     const uniqueString = generateUniqueName(10);
  //     const extensionIndex = fileName.lastIndexOf('.');
  //     const extension = fileName.slice(extensionIndex + 1);
  //     const uniqueName = fileName+uniqueString + '.' + extension;

  //     const that = this;
  //     //Todo change path according to image folder
  //     const path = encodeURIComponent("issue_images") + "/"+uniqueName;
  //     console.log(path);

  //     const uploader = this.uploadService.uploadFile(file,path,(event:any)=>{
  //       that.onProgress(event);
  //       that.cdr.markForCheck();
  //     });

  //     uploader.then(
  //         function(data) {
  //           alert("Successfully uploaded photo.");
  //           console.log(data);
  //           console.log(getCDNImage(path));
  //         })
  //           this.apiService.export({file: uploader})
  //           .pipe(first())
  //           .subscribe(
  //               data => {
  //                 // console.log(data);
  //                 if (data && data.success==true) {
  //                   // this.addForm.reset();

  //                   this.toastr.success('Asset'+' added successfully', 'Add Asset',{
  //                     timeOut: 3000,
  //                     progressBar:true,
  //                     tapToDismiss:true,
  //                     toastClass: 'flat-toast ngx-toastr'
  //                   });
  //                   this.OnAddForm.emit(data);

  //                   this.isLoading$.next(false);
  //                   this.cdr.detectChanges();
  //                 }
  //                 else
  //                 {
  //                   this.isLoading$.next(false);
  //                   this.cdr.detectChanges();
  //                   this.toastr.error("Error Adding Asset"+":"+data.message+ " Please try again after sometime.",
  //                       'Add Asset',{
  //                         timeOut: 3000,
  //                         progressBar:true,
  //                         tapToDismiss:true,
  //                         toastClass: 'flat-toast ngx-toastr'
  //                       });
  //                 }
  //               },
  //               error => {
  //                 if(error.status == 401){
  //                   this.logout();
  //                 }

  //                 this.toastr.error("Error:"+error.toString()+ " Please try again after sometime.",
  //                     'Add Asset',{
  //                       timeOut: 3000,
  //                       progressBar:true,
  //                       tapToDismiss:true,
  //                       toastClass: 'flat-toast ngx-toastr'
  //                     });
  //               });
  //           //  square_image_path = "";
  //           //  portrait_image_path = "";
  //           //  horizontal_image_path = "";
  //           //  TV_cover_image_path = "";
  //           //  og_image_path = "";

  //           //Todo For assigning uploaded filename for different file upload
  //           switch(type) {
  //             case 1:{
  //               that.pdf_path = uniqueName;

  //             }

  //           }
  //         // },
  //         // function(err) {
  //         //   console.log(err)
  //         //   console.log(err.to)
  //         //   that.toastr.error("Error uploading file:"+err,
  //         //       'Add Course',{
  //         //         timeOut: 3000,
  //         //         progressBar:true,
  //         //         tapToDismiss:true,
  //         //         toastClass: 'flat-toast ngx-toastr'
  //         //       });
  //         // }
  //     // );

  //   }

  // }

// type = type;

  uploadFile(event: any) {
    if(this.type === 0){

      const formData = new FormData();
      formData.append("files", event.addedFiles[0]);
      this.pdfFile = event.addedFiles[0];
  
      this.cdr.detectChanges();
      this.apiService
        .export(formData)
        .pipe(first())
        .subscribe(
          (data) => {
         
            if (data && data.success == true) {
              this.toastr.success("Asset" + " added successfully", "Add Asset", {
                timeOut: 3000,
                progressBar: true,
                tapToDismiss: true,
                toastClass: "flat-toast ngx-toastr",
              });
        
              this.OnAddForm.emit(data);
              this.cdr.detectChanges();
            } else {
              this.isLoading$.next(false);
              this.cdr.detectChanges();
              this.toastr.error(
                "Error Adding Asset" +
                  ":" +
                  data.message +
                  " Please try again after sometime.",
                "Add Asset",
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
              "Add Asset",
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
    if(this.type === 1){
      const formData = new FormData();
      formData.append("files", event.addedFiles[0]);
      this.pdfFile = event.addedFiles[0];
  
      this.cdr.detectChanges();
      this.apiService
        .schoolVisitBulkUpload(formData)
        .pipe(first())
        .subscribe(
          (data) => {
         
            if (data && data.success == true) {
              this.toastr.success("School Visit" + " added successfully", "Add School Visit", {
                timeOut: 3000,
                progressBar: true,
                tapToDismiss: true,
                toastClass: "flat-toast ngx-toastr",
              });
        
              this.OnAddForm.emit(data);
              this.cdr.detectChanges();
            } else {
              this.isLoading$.next(false);
              this.cdr.detectChanges();
              this.toastr.error(
                "Error Adding School Visit" +
                  ":" +
                  data.message +
                  " Please try again after sometime.",
                "Add School Visit",
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
              "Add School Visit",
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
  downloadExcel() {
    const url = this.type == 1 ? `${environment.url}/templates/Sample%20School%20Visit%20File.xlsx?version=${Date.now()}`: `${environment.url}/templates/Sample%20Asset%20File.xlsx?version=${Date.now()}`;
    console.log(url)
    window.open(url)
  }
}

