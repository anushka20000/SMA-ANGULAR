export class FileUpload {
    name: string;
    url: string;
    lastModified:string;
    size:any;
    //isChecked:false;

    constructor(name: string, url: string,lastModified: string,size:any) {
        this.name = name;
        this.url = url;
        this.lastModified = lastModified.toString().slice(0,-40);
      //  this.lastModified = lastModified;
        this.size = this.bytesToSize(size);
       // this.isChecked = false;
    }

    bytesToSize(bytes:any) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Byte';
        var x = Math.floor(Math.log(bytes) / Math.log(1024))
        var i: number = +x;
        var round = 2;
        return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
     }
}
