sap.ui.define(
    ["../BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment"
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageToast, Fragment) {
        "use strict";

        return Controller.extend("yo.test.controller.entity1.Entity1Detail", {

            ROUTE_MATCH_PATTERN: "Entity1Detail",
            MODEL_LOCAL_NAME: "local",
            MODEL_ENTITY1_NAME: "entity",
            FRAGMENT_UPDATE_NAME: "yo.test.view.entity1.Entity1Update",
            FRAGMENT_DISPLAY_NAME: "yo.test.view.entity1.Entity1Display",

            onInit: function () {

                this._sEntity1ID = null,
                this._oFragments = {};
                this._oFragmentSubSection = this.byId("fragmentSubSection");
                this._oEditButton = this.byId("editButton");
                this._oSaveButton = this.byId("saveButton");
                this._oCancelButton = this.byId("cancelButton");

                this._oLocalModel = new JSONModel({
                    busy: true,
                    entity1: {}
                });

                this.setModel(this._oLocalModel, this.MODEL_LOCAL_NAME);
                this.getRouter().getRoute(this.ROUTE_MATCH_PATTERN).attachPatternMatched(this._onObjectMatched, this);

                this._setDisplayMode();
            },

            onPressEditButton: function (oEvent) {
                this._setUpdateMode();
            },

            onPressSaveButton: function (oEvent) {
                this._save();
            },

            onPressCancelButton: function (oEvent) {
                this._oLocalModel.setProperty("/entity1", this.getView().getObjectBinding(this.MODEL_ENTITY1_NAME).getBoundContext().getObject());
                this._setDisplayMode();
            },

            _setUpdateMode: function () {
                let that = this;
                this._setFragment(
                    this.FRAGMENT_UPDATE_NAME,
                    function () {
                        that._oEditButton.setVisible(false);
                        that._oSaveButton.setVisible(true);
                        that._oCancelButton.setVisible(true);
                    });             
            },

            _setDisplayMode: function () {
                let that = this;
                this._setFragment(
                    this.FRAGMENT_DISPLAY_NAME,
                    function () {
                        that._oEditButton.setVisible(true);
                        that._oSaveButton.setVisible(false);
                        that._oCancelButton.setVisible(false);
                    });                  
            },

            _onObjectMatched : function (oEvent) {
                var sID =  oEvent.getParameter("arguments").ID;
                this._bindView(this.MODEL_ENTITY1_NAME + ">/Entity1" + sID);
                this._sEntity1ID = sID;
            },

            _bindView : function (sObjectPath) {
                let that = this;
                this.getView().bindElement({
                    path: sObjectPath,
                    events: {
                        change: this._onBindingChange.bind(this),
                        dataRequested: function () {
                            that._oLocalModel.setProperty("/busy", true);
                        },
                        dataReceived: function () {
                            that._oLocalModel.setProperty("/busy", false);
                        }
                    }
                });
            },

            _onBindingChange : function () {
/*
                // No data for the binding
                if (!oElementBinding.getBoundContext()) {
                    this.getRouter().getTargets().display("objectNotFound");
                    return;
                }
*/
                this._oLocalModel.setProperty("/entity1", this.getView().getObjectBinding(this.MODEL_ENTITY1_NAME).getBoundContext().getObject());
                this._oLocalModel.setProperty("/busy", false);
            },

            _save : function () {
                let that = this;
                this._oLocalModel.setProperty("/busy", true);
                this.getModel(this.MODEL_ENTITY1_NAME).update(
                    "/Entity1" + this._sEntity1ID + "", 
                    this._oLocalModel.getProperty("/entity1"),
                    {
                        success: function(oData, response) {
                            that._oLocalModel.setProperty("/busy", false);
                            that._setDisplayMode();
                            MessageToast.show('Entity1 updated.');
                        },
                        error: function(oError) {
                            that._oLocalModel.setProperty("/busy", false);
                            MessageToast.show('Error updating entity1.');
                        }
                    });
            },

            _setFragment: function (sName, fnAfterLoad) {
                let that = this;
                let pFragment = this._oFragments[sName];

                if (!pFragment) {
                    pFragment = Fragment.load({
                        name: sName
                    });
                }

                pFragment.then(function (oContent) {
                    that._oFragmentSubSection.removeAllBlocks();
                    that._oFragmentSubSection.insertBlock(oContent);
                    fnAfterLoad();
                });
            }
        });
    }
);
