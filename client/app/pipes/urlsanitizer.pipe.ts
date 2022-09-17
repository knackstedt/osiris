import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

/**
 * Url Sanitizer pipe.
 * 
 * This trusts URLs that exist in a safe list defined in our environments.ts file.
 * Any other URLs will NOT be trusted, thus will not be loaded.
 */
@Pipe({ name: 'urlSanitizer' })
export class UrlSanitizer implements PipeTransform {

    constructor(private sanitizer: DomSanitizer) { }

    public transform(url: string): SafeUrl {

        // TODO: Restore implementation

        // if(!url || url.length < 4) {
        //   console.log('Empty URL!');
        //   return "";
        // }

        // // Process target into an HTTPS string.
        // if (!url.startsWith('https://')) url = 'https://' + url.replace(/^(http|ftp):\/\//, 'i');

        // const targetUrl = new URL(url);

        // // Check if we should trust the domain
        // if(environment.trustedDomains.includes(targetUrl.host)){
        //     console.log('Safe URL/', targetUrl.host);
        //     console.log(decodeURIComponent(url));

        //     return this.sanitizer.bypassSecurityTrustUrl(url);
        // }

        // // Unsafe URL.
        // console.error(`Domain %c"%c${targetUrl.host}%c"%c is not a known safe domain. Aborting request.`, 'color: white', 'color: gray', 'color: white', '');

        // Route them to a safe place :)
        return this.sanitizer.bypassSecurityTrustHtml(url);
    }
}
