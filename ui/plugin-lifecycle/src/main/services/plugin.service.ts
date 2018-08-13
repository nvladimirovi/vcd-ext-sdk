import { Injectable } from "@angular/core";
import { VcdApiClient } from "@vcd/sdk";
import { Observable } from "rxjs";
import { UiPluginMetadata, UiPluginMetadataResponse } from "@vcd/bindings/vcloud/rest/openapi/model";

@Injectable()
export class PluginService {
    constructor(private client: VcdApiClient) {}

    public getPlugins(): Observable<UiPluginMetadataResponse[]> {
        return this.client.get("cloudapi/extensions/ui/");
    }

    public deletePlugin(plugin: UiPluginMetadataResponse): Observable<any> {
        return this.client.deleteSync(`cloudapi/extensions/ui/${plugin.id}`);
    }

    public disablePlugin(plugin: UiPluginMetadata, id: string): Observable<UiPluginMetadataResponse> {
        plugin.enabled = false;
        return this.client.updateSync(`cloudapi/extensions/ui/${id}`, plugin);
    }

    public enablePlugin(plugin: UiPluginMetadata, id: string): Observable<UiPluginMetadataResponse> {
        plugin.enabled = true;
        return this.client.updateSync(`cloudapi/extensions/ui/${id}`, plugin);
    }

    public changeScope(
        plugin: UiPluginMetadata,
        id: string,
        scope: { serviceProvider?: boolean, tenant?: boolean }
    ): Observable<UiPluginMetadataResponse> {
        plugin.provider_scoped = scope.serviceProvider;
        plugin.tenant_scoped = scope.tenant;

        return this.client.updateSync(`cloudapi/extensions/ui/${id}`, plugin);
    }
}
