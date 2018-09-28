/*
 * Copyright 2018 VMware, Inc. All rights reserved. VMware Confidential
 */
import { Component, Inject, OnInit, OnDestroy } from "@angular/core";
import { EXTENSION_ASSET_URL } from "@vcd/sdk/common";
import { ApiExtensionService } from "../../services/api-extension.service";
import { AdminServiceRecord } from "../../interfaces/AdminServiceRecord";
import { Observable, Subscription } from "rxjs";
import { Response } from "@angular/http";
import { ActionVerifierService } from "../../common-vcd/action-verifier.service";


@Component({
    selector: "vcd-rebranding",
    templateUrl: "./api-extensions.component.html",
    styleUrls: ["./api-extensions.component.scss"]
})
export class ApiExtensionsComponent implements OnInit, OnDestroy {
    // Selected AdminExtensionServices
    private _selected: AdminServiceRecord[] = [];

    // List of AdminExtensionServices
    public api_extensions: AdminServiceRecord[];
    // Toggle loading component
    public isLoading = false;
    // Flag for showing enable button
    public canEnable = false;
    // Flag for showing disable button
    public canDisable = false;

    // Container for subscriptions
    public subs: Subscription;

    constructor(
        @Inject(EXTENSION_ASSET_URL) public assetUrl: string,
        private apiExtensionService: ApiExtensionService,
        private actionVerifierService: ActionVerifierService
    ) { }

    // Selected AdminExtensionServices
    get selected() {
        return this._selected;
    }

    // Selected AdminExtensionServices
    set selected(val: AdminServiceRecord[]) {
        this._selected = val;

        this.canEnable = false;
        this.canDisable = false;

        const enabled = this.selected.find((as) => as.enabled === true);
        const disabled = this.selected.find((as) => as.enabled === false);

        if (enabled) {
            this.canDisable = true;
        }

        if (disabled) {
            this.canEnable = true;
        }
    }

    public ngOnInit() {
        // Load all AdminExtensionServices
        this.loadApiExtensions();
    }

    public ngOnDestroy() {
        if (this.subs) {
            // Unsubscribe from all observables in this container
            this.subs.unsubscribe();
        }
    }

    /**
     * Request all AdminExtensionServices and asign them.
     */
    public loadApiExtensions(): void {
        // Turn on loader
        this.isLoading = true;
        // Request all AdminExtensionServices
        const sub = this.apiExtensionService.getApiExtensions().subscribe((data: AdminServiceRecord[]) => {
            // Assign AdminExtensionServices
            this.api_extensions = data;
        }, (err) => {
            // Turn off loader
            this.isLoading = false;
            // Close subscription
            sub.unsubscribe();
            // Log error
            console.error(err);
        }, () => {
            // Turn off loader
            this.isLoading = false;
            // Close subscription
            sub.unsubscribe();
        });
    }

    /**
     * Refresh the list of AdminExtensionServices
     */
    public onRefresh(): void {
        this.loadApiExtensions();
    }

    /**
     * Enable list of AdminExtensionServices
     */
    public onEnable(): void {
        // Open modal
        const modalDataSub = this.actionVerifierService.openModal({
            title: "Enable",
            body: "Are you sure you want to enable the API Extensions?",
            decline: "No",
            accept: "Yes",
            waitToClose: true
        }).subscribe((data) => {
            modalDataSub.unsubscribe();

            if (!data.accept) {
                // Return if user decline the action
                // Close modal
                this.actionVerifierService.closeModal();
                return;
            }

            if (this.selected.length === 0) {
                // Return if there is no AdminExtensionServices selected
                // Close modal
                this.actionVerifierService.closeModal();
                return;
            }

            if (this.selected.length === 1 && this.selected[0].enabled === true) {
                // Return if AdminExtensionService is already enabled
                // Close modal
                this.actionVerifierService.closeModal();
                return;
            }

            // Collect all AdminExtensionServices which are ready to enable
            const readyToEnable: AdminServiceRecord[] = [];

            // Loop through the selected AdminExtensionServices
            // and add them in readyToEnable array if they are
            // not already enabled
            this.selected.forEach((sel) => {
                if (sel.enabled === true) {
                    return;
                }

                readyToEnable.push(sel);
            });

            // If all of AdminExtensionServices are enabled the user will
            // be notified with the same modal winodow.
            if (readyToEnable.length === 0) {
                const alertSub = this.actionVerifierService.openModal({
                    title: "Enable",
                    body: "All API Extensions are already enabled.",
                    accept: "Okey",
                    waitToClose: true
                }).subscribe(() => {
                    // Close modal
                    this.actionVerifierService.closeModal();
                    // Close alert modal subscription
                    alertSub.unsubscribe();
                });
                return;
            }

            // If only part of the AdminExtensionServices
            // are enable ready the user will be notified
            // how many of them will NOT be enabled, and
            // will be promped to proceed.
            if (readyToEnable.length !== this.selected.length) {
                const alertSub = this.actionVerifierService.openModal({
                    title: "Enable",
                    body: `${this.selected.length - readyToEnable.length} of ${this.selected.length} are already
                    enabled. Do you want to proceed?`,
                    accept: "Yes",
                    decline: "No",
                    waitToClose: true
                }).subscribe((alertSubData) => {
                    // Close alert modal subscription
                    alertSub.unsubscribe();

                    if (!alertSubData.accept) {
                        // Close modal
                        this.actionVerifierService.closeModal();
                        return;
                    }

                    this.actionVerifierService.closeModal();
                    this.isLoading = true;
                    const subs = this.enable(readyToEnable).subscribe(() => {}, (err) => {
                        console.error(err);
                        // Turn off loader
                        this.isLoading = false;
                        // Close enable subscriptions
                        subs.unsubscribe();
                    }, () => {
                        // Turn off loader
                        this.isLoading = false;
                        // Refresh the list of API Extensions
                        this.loadApiExtensions();
                        // Close enable subscriptions
                        subs.unsubscribe();
                    });
                });
                return;
            }

            // All selected AdminExtensionServices are
            // enable ready
            this.actionVerifierService.closeModal();
            this.isLoading = true;
            const subs = this.enable(readyToEnable).subscribe(() => {}, (err) => {
                console.error(err);
                // Turn off loader
                this.isLoading = false;
                // Close enable subscriptions
                subs.unsubscribe();
            }, () => {
                // Turn off loader
                this.isLoading = false;
                // Refresh the list of API Extensions
                this.loadApiExtensions();
                // Close enable subscriptions
                subs.unsubscribe();
            });
        });
    }

    /**
     * Disable list of AdminExtensionServices
     */
    public onDisable(): void {
        // Open modal
        const modalDataSub = this.actionVerifierService.openModal({
            title: "Disable",
            body: "Are you sure you want to disable the API Extensions?",
            decline: "No",
            accept: "Yes",
            waitToClose: true
        }).subscribe((data) => {
            modalDataSub.unsubscribe();

            if (!data.accept) {
                // Return if user decline the action
                // Close modal
                this.actionVerifierService.closeModal();
                return;
            }

            if (this.selected.length === 0) {
                // Return if there is no AdminExtensionServices selected
                // Close modal
                this.actionVerifierService.closeModal();
                return;
            }

            if (this.selected.length === 1 && this.selected[0].enabled === false) {
                // Return if AdminExtensionService is already disable
                console.log("ALREADY DISABLED!");
                // Close modal
                this.actionVerifierService.closeModal();
                return;
            }

            // Collect all AdminExtensionServices which are ready to disable
            const readyToDisable: AdminServiceRecord[] = [];

            // Loop through the selected AdminExtensionServices
            // and add them in readyToDisable array if they are
            // not already disabled
            this.selected.forEach((sel) => {
                if (sel.enabled === false) {
                    return;
                }

                readyToDisable.push(sel);
            });

            // If all of AdminExtensionServices are disabled the user will
            // be notified with the same modal winodow.
            if (readyToDisable.length === 0) {
                const alertSub = this.actionVerifierService.openModal({
                    title: "Disable",
                    body: "All API Extensions are already disabled.",
                    accept: "Okey",
                    waitToClose: true
                }).subscribe(() => {
                    // Refresh the list of API Extensions
                    this.actionVerifierService.closeModal();
                    // Close alert modal subscription
                    alertSub.unsubscribe();
                });
                return;
            }

            // If only part of the AdminExtensionServices
            // are disabled ready the user will be notified
            // how many of them will NOT be disabled, and
            // will be promped to proceed.
            if (readyToDisable.length !== this.selected.length) {
                const alertSub = this.actionVerifierService.openModal({
                    title: "Disable",
                    body: `${this.selected.length - readyToDisable.length} of ${this.selected.length} are already
                    disabled. Do you want to proceed?`,
                    accept: "Yes",
                    decline: "No",
                    waitToClose: true
                }).subscribe((alertSubData) => {
                    // Close alert modal subscription
                    alertSub.unsubscribe();

                    if (!alertSubData.accept) {
                        // Close modal window
                        this.actionVerifierService.closeModal();
                        return;
                    }

                    this.actionVerifierService.closeModal();
                    this.isLoading = true;
                    const subs = this.disable(readyToDisable).subscribe(() => {}, (err) => {
                        console.error(err);
                        // Turn off loader
                        this.isLoading = false;
                        // Close disable subscriptions
                        subs.unsubscribe();
                    }, () => {
                        // Turn off loader
                        this.isLoading = false;
                        // Refresh the list of API Extensions
                        this.loadApiExtensions();
                        // Close disable subscriptions
                        subs.unsubscribe();
                    });
                });
                return;
            }

            // All selected AdminExtensionServices are
            // disable ready
            this.actionVerifierService.closeModal();
            this.isLoading = true;
            const subs = this.disable(readyToDisable).subscribe(() => {}, (err) => {
                console.error(err);
                // Turn off loader
                this.isLoading = false;
                // Close disable subscriptions
                subs.unsubscribe();
            }, () => {
                // Turn off loader
                this.isLoading = false;
                // Refresh the list of API Extensions
                this.loadApiExtensions();
                // Close disable subscriptions
                subs.unsubscribe();
            });
        });
    }

    /**
     * Delete list of AdminExtensionServices
     */
    public onDelete(): void {
        // Open modal and wait the user to proceed
        const modalDataSub = this.actionVerifierService.openModal({
            title: "Delete",
            body: "Are you sure you want to delete these API Extensions?",
            decline: "No",
            accept: "Yes",
            waitToClose: true
        }).subscribe((data) => {
            // Close modal subscription
            modalDataSub.unsubscribe();

            // Return and close if user decline the operation
            if (!data.accept) {
                // Close modal window
                this.actionVerifierService.closeModal();
                return;
            }

            // Close modal
            this.actionVerifierService.closeModal();
            // Turn on loader
            this.isLoading = true;
            // Start delete process
            const subs = this.delete(this.selected).subscribe(() => {}, (err) => {
                const notify = this.actionVerifierService.openModal({
                    title: "Delete",
                    body: "You must disable the API Extension(s) before delete.",
                    accept: "Disable",
                    decline: "Cancel"
                }).subscribe((wantToDisable) => {
                    // Close delete subscriptions
                    subs.unsubscribe();
                    // Close notify subscription
                    notify.unsubscribe();

                    if (wantToDisable.accept) {
                        const enabled = this.selected.filter((as) => as.enabled === true);

                        const proceed = Observable.concat(
                            this.disable(enabled),
                            this.delete(enabled)
                        ).subscribe(() => {}, (proceedError) => {
                            proceed.unsubscribe();
                            console.error(proceedError);
                        }, () => {
                            proceed.unsubscribe();

                            // Turn off loader
                            this.isLoading = false;
                            // Refresh the list of API Extensions
                            this.loadApiExtensions();
                        });
                        return;
                    }

                    console.error(err);
                    // Turn off loader
                    this.isLoading = false;
                    // Refresh the list of API Extensions
                    this.loadApiExtensions();
                });
            }, () => {
                subs.unsubscribe();
                // Turn off loader
                this.isLoading = false;
                // Refresh the list of API Extensions
                this.loadApiExtensions();
            });
        });
    }

    /**
     * Loop through the list collection and request enabling, after
     * the whole list is traversed the requests will be
     * executed in parallel with merge operator.
     * @param readyTo list of AdminExtensionServices
     */
    public enable(readyTo: AdminServiceRecord[]): Observable<Response> {
        const proc: Observable<Response>[] = [];

        readyTo.forEach((ext) => {
            proc.push(
                this.apiExtensionService.enable(ext.href)
            );
        });

        return Observable.merge(...proc);
    }

    /**
     * Loop through the list collection and request disabling, after
     * the whole list is traversed the requests will be
     * executed in parallel with merge operator.
     * @param readyTo list of AdminExtensionServices
     */
    public disable(readyTo: AdminServiceRecord[]): Observable<Response> {
        const proc: Observable<Response>[] = [];

        readyTo.forEach((ext) => {
            proc.push(
                this.apiExtensionService.disable(ext.href)
            );
        });

        return Observable.merge(...proc);
    }

    /**
     * Loop through the list collection and request delete operation, after
     * the whole list is traversed the requests will be
     * executed in parallel with merge operator.
     * @param exts list of AdminExtensionServices
     */
    public delete(exts: AdminServiceRecord[]): Observable<Response> {
        const proc: Observable<Response>[] = [];

        exts.forEach((ext) => {
            proc.push(
                this.apiExtensionService.delete(ext.href)
            );
        });

        return Observable.merge(...proc);
    }
}
