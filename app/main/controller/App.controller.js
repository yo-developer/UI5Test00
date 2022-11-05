sap.ui.define(
    ["./BaseController"],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} BaseController
     */
    function (BaseController) {
        "use strict";

        return BaseController.extend("yo.test.controller.App", {
            onInit() {},

            getItemText: function(sI18nKey){
                return this.getModel("i18n").getResourceBundle().getText(sI18nKey);
            }
        });
    },
);
