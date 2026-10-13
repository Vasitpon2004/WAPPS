import { IsKuEmail } from './fields';

export class EmailDto {
  @IsKuEmail()
  email: string;
}