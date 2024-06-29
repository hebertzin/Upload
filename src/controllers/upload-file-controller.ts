import { Request, Response } from 'express'
import { UploadFileService } from '../services/upload-file-service'
import { s3 } from '../aws'
import { HttpStatusCode } from '../utils/http-status'
import { loggerService } from '../config/logger/winston'

export class UploadController {
  private uploadService: UploadFileService

  constructor(uploadService: UploadFileService) {
    this.uploadService = uploadService
  }

  public handle = async (request: Request, response: Response) => {
    try {
      const file = request.file

      if (!file) {
        return response
          .status(HttpStatusCode.BadRequest)
          .json({ message: 'No file provided' })
      }

      const data = await this.uploadService.invoke(file)

      if (data) {
        return response
          .status(HttpStatusCode.Conflict)
          .json({ msg: 'file already exist' })
      }

      return response.status(HttpStatusCode.Created).json(data)
    } catch (error) {
      return response.status(HttpStatusCode.InternalServerError).json({ error })
    }
  }
}

export const uploadFileService = new UploadFileService(
  s3,
  'storage-app',
  loggerService,
)

export const uploadFileControllerHandler = new UploadController(
  uploadFileService,
)
