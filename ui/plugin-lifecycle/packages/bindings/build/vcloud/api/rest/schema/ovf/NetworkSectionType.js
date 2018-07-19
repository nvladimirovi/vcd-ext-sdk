"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var SectionType_1 = require("./SectionType");
var NetworkSectionType = (function (_super) {
    __extends(NetworkSectionType, _super);
    function NetworkSectionType() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return NetworkSectionType;
}(SectionType_1.SectionType));
exports.NetworkSectionType = NetworkSectionType;
(function (NetworkSectionType) {
    var Fields = (function (_super) {
        __extends(Fields, _super);
        function Fields() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Fields;
    }(SectionType_1.SectionType.Fields));
    NetworkSectionType.Fields = Fields;
})(NetworkSectionType = exports.NetworkSectionType || (exports.NetworkSectionType = {}));
exports.NetworkSectionType = NetworkSectionType;