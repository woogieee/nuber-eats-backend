import got from 'got';
import * as FormData from 'form-data';
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailVars, MailModuleOptions } from './mail.interfaces';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {}

  // Email 보내기
  private async sendEmail(
    subject: string,
    template: string,
    emailVars: EmailVars[],
  ) {
    const form = new FormData();
    form.append('from', `Nuber Eats <mailgun@${this.options.domain}>`);
    form.append('to', `kimdw@hklogistics.kr`);
    form.append('subject', subject);
    form.append('template', template);
    emailVars.forEach((eVar) => form.append(eVar.key, eVar.value));
    try {
      await got(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(
            `api:${this.options.apiKey}`,
          ).toString('base64')}`,
        },
        body: form,
      });
    } catch (error) {
      console.log(error);
    }
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail('Verify Your Email', 'verify-email', [
      { key: 'code', value: code },
    ]);
  }
}
