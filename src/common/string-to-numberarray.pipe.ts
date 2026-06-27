import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class StringToNumberarrayPipePipe implements PipeTransform<
  string,
  number[]
> {
  transform(value: string): number[] {
    if (!value) return [];
    return value.split(',').map((v) => parseInt(v.trim(), 10));
  }
}
