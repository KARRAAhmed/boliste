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

	var oModel;
	var semantic_object;

	return BaseController.extend("com.aymax.apave.sd.BureauOrdre.BureauOrdreDisplay.controller.Worklist", {

		formatter: formatter,
		ODataManager: ODataManager,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			debugger;
			this.semantic_object = window.location.hash;
			var oViewModel,
				iOriginalBusyDelay,
				oTable = this.byId("table");

			/*Setting the UIConfig init model */
			models.resetUIConfig.bind(this)();

			// Put down worklist table's original value for busy indicator delay,
			// so it can be restored later on. Busy handling on the table is
			// taken care of by the table itself.
			iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
			// keeps the search state
			this._aTableSearchState = [];

			this.aKeys = [
				"Zrefde", "Zlibcat", "Zlibscat", "ZlibNr", "Zlibtypobj", "Zlibclient",
				"Zemp", "Zdar", "Zdem", "Zdec", "DateCre", "Zlibserv", "Zstatde"
			];
			//get components
			this.ofilter = this.getView().byId("smartFilterBar");
			this.oTable = this.getSelect("table");
			this.oZrefde = this.getSelect("InputFilter_Zrefde");
			this.oZrefcat = this.getSelect("MultiBoxCategorie");
			this.oZscatref = this.getSelect("MultiBoxSousCategorie");
			this.oZLIB_NR = this.getSelect("MultiBoxNatureReception");
			this.oZreftypobj = this.getSelect("MultiBoxTypeObjet");
			this.oZclient = this.getSelect("MultiBoxClient");
			this.oZemp = this.getSelect("MultiBoxEmployees");
			this.oZcompt = this.getSelect("id_filterGup_Zcompt");
			this.oZdar = this.getSelect("InputFilter_dateArrive");
			this.oZdem = this.getSelect("InputFilter_dateEmission");
			this.oZdec = this.getSelect("InputFilter_dateEchance");
			this.oZCSERV = this.getSelect("MultiBoxService");
			this.oZstatde = this.getSelect("MultiBoxStatut");
			this.oDateCre = this.getSelect("InputFilter_dateCreation");

			//add for the seconde app
			if (this.semantic_object === '#ZBureauDordre-displayFactSheet') {
				this.oZstatde.setSelectedKeys(['001', '006']);
				this.oZstatde.setEnabled(false);
			}

			// Model used to manipulate control states
			oViewModel = new JSONModel({
				worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
				saveAsTileTitle: this.getResourceBundle().getText("saveAsTileTitle", this.getResourceBundle().getText("worklistViewTitle")),
				shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
				shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
				shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
				tableNoDataText: this.getResourceBundle().getText("tableNoDataText"),
				tableBusyDelay: 0
			});
			this.setModel(oViewModel, "worklistView");

			//set oModel
			oModel = this.getOwnerComponent().getModel();
			//get relation & mode
			var rolesecretaire = false;
			oModel.read("/User_RolesSet", {
				success: function (oData) {
					for (var i = 0; i < oData.results.length; i++) {
						if (oData.results[i].Roleid === "ZBO_INBOX") {
							this.getOwnerComponent().getModel("UIConfig").setProperty("/rolesecretaire", true);
						}
					}
				}.bind(this),
				error: function (oError) {

				}.bind(this)
			});

			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			oTable.attachEventOnce("updateFinished", function () {
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});
			// Add the worklist page to the flp routing history
			this.addHistoryEntry({
				title: this.getResourceBundle().getText("worklistViewTitle"),
				icon: "sap-icon://table-view",
				intent: "#test-display"
			}, true);

			if (!this.__busyDialog) {
				this.__busyDialog = sap.ui.xmlfragment("com.aymax.apave.sd.BureauOrdre.BureauOrdreDisplay.fragments.BusyIndicator",
					this);
			}
			var complete_url = window.location.href;
			// var complete_url =	"https://vm-devqas-01.k2udssr2mqxubk2kj4pez0misf.ax.internal.cloudapp.net:44300/sap/bc/ui2/flp#ZBureauDordre-manage?Zrefde=01232021";

			var params = complete_url.split("#")[1].split("?");
			if (params && params[1]) {
				var param_value = params[1].split("=");

				$.sap.refdoc = param_value[1];
				if ($.sap.refdoc) {
					this.getView().byId("InputFilter_Zrefde").setValue($.sap.refdoc);
				}

			}

		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function () {
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject: function (oItem) {
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("Refcat")
			});
		},

		//-----------------------------------------------------------------------------------------------------------------------------------
		//	******************************************************* Filter Functions********************************************************
		//-----------------------------------------------------------------------------------------------------------------------------------

		//---------------------------------------------------------------------------------------------------------------------------
		//	 get component by Id
		//---------------------------------------------------------------------------------------------------------------------------

		getSelect: function (sId) {
			return this.getView().byId(sId);
		},

		//---------------------------------------------------------------------------------------------------------------------------
		//	 get filter component value
		//---------------------------------------------------------------------------------------------------------------------------

		getSelectedItemText: function (oSelect) {

			return oSelect.getValue().toUpperCase();
		},

		//---------------------------------------------------------------------------------------------------------------------------
		//	 get selectedkey filter component value
		//---------------------------------------------------------------------------------------------------------------------------

		getSelectedKey: function (oSelect) {

			if (oSelect.getSelectedKeys()) {
				return oSelect.getSelectedKeys().toString();
			}

		},

		//---------------------------------------------------------------------------------------------------------------------------
		//	 filter table Items
		//---------------------------------------------------------------------------------------------------------------------------

		onBeforeRebindTable: function (OEvent) {
			var binding = OEvent.getParameter("bindingParams");
			var aCurrentFilterValues = [];

			aCurrentFilterValues.push(this.getSelectedItemText(this.oZrefde).replace("/", ""));
			aCurrentFilterValues.push(this.getSelectedKey(this.oZrefcat));
			aCurrentFilterValues.push(this.getSelectedKey(this.oZscatref));
			aCurrentFilterValues.push(this.getSelectedKey(this.oZLIB_NR));
			aCurrentFilterValues.push(this.getSelectedKey(this.oZreftypobj));
			aCurrentFilterValues.push(this.getSelectedKey(this.oZclient));
			aCurrentFilterValues.push(this.getSelectedKey(this.oZemp));
			aCurrentFilterValues.push(this.oZdar.getValue());
			aCurrentFilterValues.push(this.oZdem.getValue());
			aCurrentFilterValues.push(this.oZdec.getValue());
			aCurrentFilterValues.push(this.oDateCre.getValue());
			aCurrentFilterValues.push(this.getSelectedKey(this.oZCSERV));

			//add for the second app
			if (this.semantic_object === '#ZBureauDordre-displayFactSheet') {
				aCurrentFilterValues.push(['001', '006']);
				this.oZstatde.setSelectedKeys(['001', '006']);
				this.oZstatde.setEnabled(false);
			} else {
				aCurrentFilterValues.push(this.getSelectedKey(this.oZstatde));
			}

			var aFilters = this.getFilters(aCurrentFilterValues);
			if (aFilters.length > 0) {
				aFilters.forEach(function (afilter, f) {
					binding.filters.push(afilter);
				});
			}
		},

		//---------------------------------------------------------------------------------------------------------------------------
		//	 get filters
		//---------------------------------------------------------------------------------------------------------------------------

		getFilters: function (aCurrentFilterValues) {
			this.aFilters = [];
			var octx = this;

			this.aKeys.map(function (sCriteria, j) {
				//si le champ est rempli , on va ajouter un filter avec ce key
				if (aCurrentFilterValues[j]) {
					if (j === 7 || j === 8 || j === 9 || j === 10) {
						var dateArray = aCurrentFilterValues[j].split(" - ");

						var dateMin = dateArray[0].replaceAll("/", "");
						var dateMax = dateArray[1].replaceAll("/", "");
						octx.aFilters.push(new Filter(sCriteria, sap.ui.model.FilterOperator.BT, dateMin, dateMax));
					} else {
						octx.aFilters.push(new Filter(sCriteria, sap.ui.model.FilterOperator.EQ, aCurrentFilterValues[j]));
					}
				}
			});

			return this.aFilters;
		},

		//---------------------------------------------------------------------------------------------------------------------------
		//	 Clear All filters Inputs
		//---------------------------------------------------------------------------------------------------------------------------

		onClear: function (oEvent) {

			this.oZrefde.setValue();
			this.oZrefcat.setSelectedKeys();
			this.oZscatref.setSelectedKeys();
			this.oZLIB_NR.setSelectedKeys();
			this.oZreftypobj.setSelectedKeys();
			this.oZclient.setSelectedKeys();
			this.oZdar.setValue();
			this.oZdem.setValue();
			this.oZdec.setValue();
			this.oZemp.setSelectedKeys();
			this.oZstatde.setSelectedKeys();
			this.oZCSERV.setSelectedKeys();
			this.oDateCre.setValue();
			//add for the second app
			if (this.semantic_object === '#ZBureauDordre-displayFactSheet') {
				this.oZstatde.setSelectedKeys(['001', '006']);
				this.oZstatde.setEnabled(false);
			}

			this.ofilter.fireSearch();
		},

		//---------------------------------------------------------------------------------------------------------------------------
		//		on Selection Change Categorie (update bindings of SousCategorie & TypeObj Multicombobox)
		//---------------------------------------------------------------------------------------------------------------------------
		onSelectionChangeCategorie: function (oEvent) {

			var sousCategorie = this.getView().byId("MultiBoxSousCategorie");
			var typeObjet = this.getView().byId("MultiBoxTypeObjet");
			var selectedCategories = oEvent.getSource().getSelectedKeys();
			var oItemTemplateSSCateg = sousCategorie.getBindingInfo("items").template;

			var oItemTemplateTypeObj = typeObjet.getBindingInfo("items").template;

			if (selectedCategories.length > 0) {

				var selectedCategString = selectedCategories.toString();
				var oFiltersSSCateg = [new sap.ui.model.Filter("Dessouscat", sap.ui.model.FilterOperator.EQ, selectedCategString)];
				var oFiltersTypj = [new sap.ui.model.Filter("Destypobj", sap.ui.model.FilterOperator.EQ, selectedCategString)];

				//get the related sub-categories 
				sousCategorie.bindItems("/SUB_CATEGORYSet", oItemTemplateSSCateg, null, oFiltersSSCateg);

				//get the related type objet	
				typeObjet.bindItems("/Object_TYPESet", oItemTemplateTypeObj, null, oFiltersTypj);

			} else {
				sousCategorie.bindItems("/SUB_CATEGORYSet", oItemTemplateSSCateg);
			}
		},

		onLiveChangeDocRef: function (oEvent) {
			var oControl = oEvent.getSource();
			oControl.setFilterFunction(function (sTerm, oItem) {
				return oItem.getText();
			});
		},

		//----------------------------------------------------------------------------------------------------------------------------------------------------
		//													on Diffuser documents entrants
		//----------------------------------------------------------------------------------------------------------------------------------------------------

		onDiffuser: function (oEvent) {
			var table = this.getView().byId("tab");
			var SelectedTableItems = table.getSelectedItems();
			var count = table.getSelectedItems().length;
			var selectedItems = [];
			var verif = true;
			var oContext = this;

			if (count === 0) {
				MessageToast.show("Veillez sélectionner une ou plusieurs lignes", {
					duration: 100
				});
			} else {

				SelectedTableItems.forEach(function (item, i) {
					var sDocRef = item.getBindingContext().getProperty("Zrefde");
					var object = oContext.getOwnerComponent().getModel().getData("/Document_entrantSet('" + sDocRef +
						"')")
					selectedItems.push(sDocRef);

					//30/08

					//	if (object.Zstatid === "002" || object.Zstatid === "003" || object.Zstatid === "004" || object.Zstatid === "005" || object.Zstatid === "006") {
					if (object.Zstatid === "002" || object.Zstatid === "003" || object.Zstatid === "004" || object.Zstatid === "005") {
						verif = false;
					}
				});

				if (!verif) {
					MessageToast.show("Veillez sélectionner des documents avec le statut Crée", {
						duration: 5000
					});
				} else {

					var that = this;
					var StrDocuments = selectedItems.toString();
					this.__busyDialog.open();
					BureauOrdre.setDiffuserDocument(oModel, StrDocuments).then(
						function (oData) {
							that.__busyDialog.close();
							that.byId("DEListPageHeader").setShowFooter(true);
						}).catch(function (error) {
						that.__busyDialog.close();
					});

                    var msg = 'le document ' + StrDocuments + 'est diffusé' ;
					MessageToast.show(msg, {
						duration: 5000
					});
					table.removeSelections();
					this.ofilter.fireSearch();
				}
			}

		},

		//----------------------------------------------------------------------------------------------------------------------------------------------------
		//													on navigate to cross nav 
		//----------------------------------------------------------------------------------------------------------------------------------------------------

		onNavigateToCrossApp: function (oEvent) {

			var BtnId = oEvent.getParameters().id.split("--")[2];
			var table = this.getView().byId("tab");
			var count = table.getSelectedItems().length;

			if (BtnId === "BtnCreate" || (BtnId === "BtnModifier" && count === 1)) {

				var refDoc = table.getSelectedItem().getBindingContext().getProperty("Zrefde");
				var semanticObj = "";
				var action = "";
				var params = "";

				if (BtnId === "BtnCreate") {
					semanticObj = "ZBureauDordre";
					action = "create";

				} else if (BtnId === "BtnModifier") {
					semanticObj = "ZBureauDordre";
					action = "manage";
					params = "?Zrefde=" + refDoc;
				}
				var hash = "#" + semanticObj + "-" + action;
				sap.m.URLHelper.redirect(hash + params, true);

			} else {
				MessageToast.show("Veillez sélectionner une seule ligne", {
					duration: 5000
				});
			}
		},

		handleDetailPopoverPress: function (oEvent) {

			var oLink = oEvent.getSource(),
				oView = this.getView();
			var refDoc = oLink.getBindingContext().getProperty("Zrefde");
			var oContext = this;
			var i18nModel = oContext.getOwnerComponent().getModel("i18n");

			this.onExitPopover();
			if (!this._pPopover) {
				this._pPopover = Fragment.load({
					id: oView.getId(),
					name: "com.aymax.apave.sd.BureauOrdre.BureauOrdreDisplay.fragments.Detail",
					controller: this
				}).then(function (oPopover) {
					oView.addDependent(oPopover);
					oPopover.bindElement("/Document_entrantSet('" + refDoc + "')");
					oContext._pPopover = oPopover;
					oContext._pPopover.setModel(i18nModel, "i18n");
					return oPopover;
				});
			}
			this._pPopover.then(function (oPopover) {
				oPopover.openBy(oLink);
			});
		},

		/*function to open Message Fragment 
		// fonction pour ouvrir le fragment du message popover */
		openMessageFragment: function (oEvent) {

			let source = oEvent.getSource();
			if (!this._oPopoverMsg) {
				let frg = "com.aymax.apave.sd.BureauOrdre.BureauOrdreDisplay.fragments.MessagePop";
				this._getFragment(frg).then(messagePop => {
					this._oPopoverMsg = messagePop;
					this._oPopoverMsg.openBy(source);
					this.getView().addDependent(this._oPopoverMsg);
				});
			} else {
				this._oPopoverMsg.openBy(source);
			}
		},

		/* Private methode to load fragment 
		 */
		_getFragment: function (name) {
			return Fragment.load({
				name: name,
				type: "XML",
				controller: this
			}).then(addRole => {
				return addRole;
			});
		},

		onExitPopover: function (oEvent) {
			this._pPopover = undefined;
		},
		onNavToDocUpdate: function (oEvent) {
			var table = this.getView().byId("tab");
			var count = table.getSelectedItems().length;

			if (count !== 1) {
				MessageToast.show("Veillez sélectionner une seule ligne", {
					duration: 5000
				});
			} else {

				var BtnId = oEvent.getParameters().id.split("--")[2];
				var refDoc = table.getSelectedItem().getBindingContext().getProperty("Zrefde");
				var semanticObj = "";
				var action = "";
				var params = "";

				if (BtnId === "BtnTraiter") {
					semanticObj = "ZBureauDordre";
					action = "create";
					params = "?Zrefde=" + refDoc;

				} else if (BtnId === "BtnModifier") {
					semanticObj = "ZBureauDordre";
					action = "manage";
					params = "?Zrefde=" + refDoc;
				} else if (BtnId === "btnNav") {
					semanticObj = "ZBureauDordre";
					action = "manage";
					params = "?Zrefde=" + refDoc;
				}

				var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
				var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
					target: {
						semanticObject: semanticObj,
						action: action
					}
				})) || "";
				//Generate a  URL for the second application
				var url = window.location.href.split('#')[0] + hash + params; // + selectedItemPath;
				sap.m.URLHelper.redirect(url, true);

			}

		},
		onSelectionChange: function (oEvent) {
			var sSelectedDocsCount = this.getView().byId("tab").getSelectedItems().length;
			if (sSelectedDocsCount === 0) {
				/*Rest buttons onDiffuser + Modifier to enabled = false*/
				this.getOwnerComponent().getModel("UIConfig").setProperty("/editability/Diffuser", false);
				this.getOwnerComponent().getModel("UIConfig").setProperty("/tooltip/Diffuser", "Veuillez selectionnez un ou plusieurs documents");

				this.getOwnerComponent().getModel("UIConfig").setProperty("/editability/Modifier", false);
				this.getOwnerComponent().getModel("UIConfig").setProperty("/tooltip/Modifier", "Veuillez selectionnez un document");
			}
			if (sSelectedDocsCount === 1) {
				/*Rest buttons onDiffuser + Modifier to enabled = true*/
				if (this.getOwnerComponent().getModel("UIConfig").getProperty("/rolesecretaire")) {
					this.getOwnerComponent().getModel("UIConfig").setProperty("/editability/Diffuser", true);
					this.getOwnerComponent().getModel("UIConfig").setProperty("/tooltip/Diffuser", "Diffuser");

					this.getOwnerComponent().getModel("UIConfig").setProperty("/editability/Modifier", true);
					this.getOwnerComponent().getModel("UIConfig").setProperty("/tooltip/Modifier", "Modifier");
				}
			}
			if (sSelectedDocsCount > 1) {
				if (this.getOwnerComponent().getModel("UIConfig").getProperty("/rolesecretaire")) {
					/*Rest buttons onDiffuser + Modifier to enabled = true*/
					this.getOwnerComponent().getModel("UIConfig").setProperty("/editability/Diffuser", true);
					this.getOwnerComponent().getModel("UIConfig").setProperty("/tooltip/Diffuser", "Diffuser");

					this.getOwnerComponent().getModel("UIConfig").setProperty("/editability/Modifier", false);
					this.getOwnerComponent().getModel("UIConfig").setProperty("/tooltip/Modifier", "Veuillez selectionnez un et un seul document");
				}
			}
		},
		onNavigateToHistorique: function () {
			this.getRouter().navTo("Historique");
		}

	});
});