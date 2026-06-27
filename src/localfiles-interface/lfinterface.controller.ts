import { Controller, Get } from '@nestjs/common';
import { LocalFilesInterfaceService } from './lfinterface.service';

@Controller('localfiles')
export class LocalFilesInterfaceController {
  constructor(private readonly localFilesService: LocalFilesInterfaceService) {}

  @Get('/read-folder')
  readFolder(): void {
    const files = this.localFilesService.loadAllFiles();
    const ids = this.localFilesService.mapFileToId(files);
    this.localFilesService.addLocalFiles(ids);
  }
}
