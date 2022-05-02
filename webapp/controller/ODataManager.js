sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (UI5Object, Filter, FilterOperator) {
	"use strict";

	return UI5Object.extend("com.aymax.apave.sd.gestionfichereleve.updateFicheReleve.controller.ODataManager", {

		/**
		 * handle request of creation and get profile of user.
		 * @class
		 * @param {sap.ui.core.UIComponent} oComponent reference to the app's component
		 * @public
		 * @alias ff.controller.ODataManager
		 */
		constructor: function (oComponent) {
			this._oResourceBundle = oComponent.getModel("i18n").getResourceBundle();
			this._oComponent = oComponent;
			this._oModel = oComponent.getModel();

		},
		/**
		 * generic method which you can send params and call function on backend .
		 * @class
		 * @param {string} aUrlParams params to send to the function
		 * @param {string} sNameOfFunction reference to function on backend
		 * @param {string} sMethod  method can be POST ,GET or PUT
		 * @param {string} sModel  reference to model name
		 */

		CallFunctionSimple: function (aUrlParams, sNameOfFunction, sMethod, sModel, sComponent) {
			var oContext = this;

			this._oModel.callFunction("/" + sNameOfFunction, {
				method: sMethod,
				urlParameters: aUrlParams,
				success: function (oData, oResponse) {
					sComponent.close();
					var jModel = new sap.ui.model.json.JSONModel();
					var myData = {};
					myData = oData;
					jModel.setData(myData);
					oContext._oComponent.setModel(jModel, sModel);
				}

			});
		},

		parseBatchResponse: function (aBatchChanges) {

			for (var i = 0; i < aBatchChanges.length; i++) {
				if (aBatchChanges[i].statusCode !== "200") {
					return aBatchChanges[i];
				}
			}

		}

	});
});