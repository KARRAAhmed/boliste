sap.ui.define([], function () {
	"use strict";

	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit: function (sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},

		statutDiffuse: function (sValue) {
			if (sValue === "002") {
				return "sap-icon://complete";
			} else {
				return "sap-icon://border";
			}

		},
		
		statutColor: function (sValue) {
			if (sValue === "002") {
				return "green";
			} else {
				return "black";
			}

		},
		refFormatter: function (sValue) {
			if (sValue) {
				var sId = sValue.substring(0, 4);
				var sYear = sValue.substring(4, sValue.length);
				return sId + "/" + sYear;
			}
			return sValue;

		}

	};

});