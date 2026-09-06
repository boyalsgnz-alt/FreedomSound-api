import { Controller, HttpCode, Post } from '@nestjs/common';
import { LocalFilesInterfaceService } from './lfinterface.service';

@Controller('localfiles')
export class LocalFilesInterfaceController {
  constructor(private readonly localFilesService: LocalFilesInterfaceService) {}

  /**
   * Kicks off the local-files scan/import in the background and returns immediately.
   * Progress is reported via the job-events WebSocket gateway (see JOB_EVENT).
   */
  @HttpCode(202)
  @Post('/read-folder')
  readFolder(): void {
    const files = this.localFilesService.loadAllFiles();
    const ids = this.localFilesService.mapFileToId(files);
    void this.localFilesService.addLocalFiles(ids);
  }
}
