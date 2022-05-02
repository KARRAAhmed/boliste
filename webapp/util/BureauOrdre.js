sap.ui.define([], function () {
	const BureauOrdre = {

	};

	BureauOrdre.setDiffuserDocument = function (oModel, documents) {
			return new Promise((resolve, reject) => {
				oModel.callFunction("/setDiffuserDocument", {
					method: "POST",
					urlParameters: {
						Documents: documents
					},
					success: function (oData, oResponse) {
						resolve(oResponse);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
		}

	
		
		

	return BureauOrdre;
})