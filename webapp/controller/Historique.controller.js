sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast",
	"com/aymax/apave/sd/BureauOrdre/BureauOrdreDisplay/controller/ODataManager",
	"com/aymax/apave/sd/BureauOrdre/BureauOrdreDisplay/util/BureauOrdre",
	"sap/m/MessagePopover",
	"../model/models"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, Fragment, MessageToast, ODataManager, BureauOrdre,
	MessagePopover, models) {
	"use strict";
	return BaseController.extend("com.aymax.apave.sd.BureauOrdre.BureauOrdreDisplay.controller.Historique", {
		onNavigateToRecherche : function(){
			this.getRouter().navTo("worklist");
		}
	});
});