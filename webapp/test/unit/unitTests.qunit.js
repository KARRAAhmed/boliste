/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/aymax/apave/sd/BureauOrdre/BureauOrdreDisplay/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});