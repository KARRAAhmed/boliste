sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/base/util/ObjectPath"
], function (JSONModel, Device, ObjectPath) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createFLPModel: function () {
			var fnGetUser = ObjectPath.get("sap.ushell.Container.getUser"),
				bIsShareInJamActive = fnGetUser ? fnGetUser().isJamActive() : false,
				oModel = new JSONModel({
					isShareInJamActive: bIsShareInJamActive
				});
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		resetUIConfig: function () {
			var oUIConfig = this.getOwnerComponent().getModel("UIConfig");
			var sJSONPath = jQuery.sap.getModulePath("com.aymax.apave.sd.BureauOrdre.BureauOrdreDisplay", "/model/UIConfig.json");
			oUIConfig.loadData(sJSONPath, false);
		}
	};
});