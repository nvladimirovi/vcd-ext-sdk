import { Injectable, Inject } from "@angular/core";
import { AuthTokenHolderService, API_ROOT_URL } from "@vcd/sdk/common";
import { Http, ResponseContentType, Headers } from "@angular/http";
import { XMLHelper } from "../classes/xml-helper";

@Injectable()
export class ApiExtensionService {
    constructor(
        @Inject(API_ROOT_URL) private baseUrl: string = "",
        private http: Http,
        private auth: AuthTokenHolderService
    ) {}

    /**
     * Requst list of API Extensions the response is in xml.
     */
    public getApiExtensions() {
        const headers = new Headers({
            "Accept": "application/*+xml;version=29.0",
            "x-vcloud-authorization": this.auth.token
        });

        return this.http.get(`${this.baseUrl}/api/admin/extension/service/query`, {
            headers,
            responseType: ResponseContentType.Text
        }).map((data) => {
            const xml = new DOMParser().parseFromString(data.text(), "text/xml");
            let res = XMLHelper.xmlToJson<any>(xml).QueryResultRecords.AdminServiceRecord || null;

            if (!res) {
                return [];
            }

            if (!Array.isArray(res)) {
                res = [res];
            }

            return res;
        });
    }

    /**
     * Enable specific API Extension the body is in xml.
     * @param url API Extension url
     */
    public enable(url: string) {
        const headers = new Headers({
            "Accept": "application/*+xml;version=29.0",
            "x-vcloud-authorization": this.auth.token,
            "Content-Type": "application/vnd.vmware.admin.service+xml"
        });

        const body = `<?xml version="1.0" encoding="UTF-8"?>
        <vmext:Service xmlns="http://www.vmware.com/vcloud/v1.5" xmlns:vmext="http://www.vmware.com/vcloud/extension/v1.5" name="gcp-ticketing">
           <vmext:Namespace>local.gcp.ticketing</vmext:Namespace>
           <vmext:Enabled>true</vmext:Enabled>
           <vmext:RoutingKey>gcp-ticketing</vmext:RoutingKey>
           <vmext:Exchange>vcdext</vmext:Exchange>
           <vmext:ApiFilters>
              <vmext:ApiFilter>
                 <vmext:UrlPattern>(/api/org/.*/ticketing/*[0-9]*)</vmext:UrlPattern>
              </vmext:ApiFilter>
           </vmext:ApiFilters>
        </vmext:Service>`;

        return this.http.put(url, body, {
            headers,
            responseType: ResponseContentType.Text
        });
    }

    /**
     * Disable specific API Extension the body is in xml.
     * @param url API Extension url
     */
    public disable(url: string) {
        const headers = new Headers({
            "Accept": "application/*+xml;version=29.0",
            "x-vcloud-authorization": this.auth.token,
            "Content-Type": "application/vnd.vmware.admin.service+xml"
        });

        const body = `<?xml version="1.0" encoding="UTF-8"?>
        <vmext:Service xmlns="http://www.vmware.com/vcloud/v1.5" xmlns:vmext="http://www.vmware.com/vcloud/extension/v1.5" name="gcp-ticketing">
           <vmext:Namespace>local.gcp.ticketing</vmext:Namespace>
           <vmext:Enabled>false</vmext:Enabled>
           <vmext:RoutingKey>gcp-ticketing</vmext:RoutingKey>
           <vmext:Exchange>vcdext</vmext:Exchange>
           <vmext:ApiFilters>
              <vmext:ApiFilter>
                 <vmext:UrlPattern>(/api/org/.*/ticketing/*[0-9]*)</vmext:UrlPattern>
              </vmext:ApiFilter>
           </vmext:ApiFilters>
        </vmext:Service>`;

        return this.http.put(url, body, {
            headers,
            responseType: ResponseContentType.Text
        });
    }

    /**
     * Delete specific API Extension
     * @param url API Extension url
     */
    public delete(url: string) {
        const headers = new Headers({
            "Accept": "application/*+xml;version=29.0",
            "x-vcloud-authorization": this.auth.token
        });

        return this.http.delete(url, {
            headers,
            responseType: ResponseContentType.Text
        });
    }
}
