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

        return Controller.extend("yo.test.controller.entity2.Entity2Detail", {

            ROUTE_MATCH_PATTERN: "Entity2Detail",
            MODEL_LOCAL_NAME: "local",
            MODEL_ENTITY2_NAME: "entity",
            FRAGMENT_UPDATE_NAME: "yo.test.view.entity2.Entity2Update",
            FRAGMENT_DISPLAY_NAME: "yo.test.view.entity2.Entity2Display",
            FRAGMENT_ENTITY1_VALUE_HELP_NAME: "yo.test.view.entity1.Entity1ValueHelp",

            onInit: function () {

                this._sEntity2ID = null,
                this._oFragments = {};
                this._oFragmentSubSection = this.byId("fragmentSubSection");
                this._oEditButton = this.byId("editButton");
                this._oSaveButton = this.byId("saveButton");
                this._oCancelButton = this.byId("cancelButton");
                this._oEntity1ValueHelpDialog = null;

                this._oLocalModel = new JSONModel({
                    busy: true,
                    entity2: null,
                    associations: {
                        entity1: null
                    }
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
                this._oLocalModel.setProperty("/entity2", this.getView().getObjectBinding(this.MODEL_ENTITY2_NAME).getBoundContext().getObject());
                this._setDisplayMode();
            },

            onPressBackButton: function (oEvent) {
                this.onNavBack();
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
                this._bindView(this.MODEL_ENTITY2_NAME + ">/Entity2" + sID);
                this._sEntity2ID = sID;
            },

            _bindView : function (sObjectPath) {
                let that = this;
                this.getView().bindElement({
                    path: sObjectPath,
                    parameters: {
                        expand: 'entity1'
                    },
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
                //this._oLocalModel.setProperty("/entity2", this.getView().getObjectBinding(this.MODEL_ENTITY2_NAME).getBoundContext().getObject());
                let oEntity2 = this.getView().getObjectBinding(this.MODEL_ENTITY2_NAME).getBoundContext().getObject();
                delete oEntity2.entity1;
                this._oLocalModel.setProperty("/entity2", oEntity2);
                this._oLocalModel.setProperty("/associations/entity1", this.getView().getObjectBinding(this.MODEL_ENTITY2_NAME).getBoundContext().getProperty("entity1"));
                this._oLocalModel.setProperty("/busy", false);

                // Otra manera de acceder al modelo
                //this.getModel("entity").getObject("/Entity2"+this._sEntity2ID)
                //this.getModel("entity").getObject("/Entity2"+this._sEntity2ID+"/entity1")
            },

            _save : function () {
                let that = this;
                this._oLocalModel.setProperty("/busy", true);
                this.getModel(this.MODEL_ENTITY2_NAME).update(
                    "/Entity2" + this._sEntity2ID + "", 
                    this._oLocalModel.getProperty("/entity2"),
                    {
                        success: function(oData, response) {
                            that._oLocalModel.setProperty("/busy", false);
                            that._setDisplayMode();
                            MessageToast.show('Entity2 updated.');
                        },
                        error: function(oError) {
                            that._oLocalModel.setProperty("/busy", false);
                            MessageToast.show('Error updating entity2.');
                        }
                    });
            },

            _setFragment: function (sName, fnAfterLoad) {
                let that = this;
                let pFragment = this._oFragments[sName];

                if (!pFragment) {
                    pFragment = Fragment.load({
                        name: sName,
                        controller: this
                    });
                }

                pFragment.then(function (oContent) {
                    that._oFragmentSubSection.removeAllBlocks();
                    that._oFragmentSubSection.insertBlock(oContent);
                    fnAfterLoad();
                });
            },

            onEntity1ValueHelpRequest: function (oEvent) {
                var that = this;
                if (!this._oEntity1ValueHelpDialog) {
                    this.loadFragment({
                        name: this.FRAGMENT_ENTITY1_VALUE_HELP_NAME,
                        controller: this
                    }).then(function(oDialog) {
                        that._oEntity1ValueHelpDialog = oDialog;
                        that._oEntity1ValueHelpDialog.open();
                    })
                } else {
                    this._oEntity1ValueHelpDialog.open();
                };
            },

            onEntity1ValueHelpDialogConfirm : function (oEvent) {
                let oSelected = oEvent.getParameters("selectedItem").selectedItem.getBindingContext("entity").getObject();
                if (oSelected) {
                    this._oLocalModel.setProperty("/entity2/entity1_ID", oSelected.ID);
                    this._oLocalModel.setProperty("/associations/entity1", oSelected);
                }
            },

            onEntity1ValueHelpDialogSearch: function (oEvent) {
                let sQuery = oEvent.getParameter("value");
                let aFilter = [];
                if (sQuery) {
                    aFilter.push(
                        new Filter({
                            filters: [
                                new Filter({    
                                    path: 'title',
                                    operator: FilterOperator.Contains,
                                    value1: sQuery
                                }),
                                new Filter({
                                    path: 'descr',
                                    operator: FilterOperator.Contains,
                                    value1: sQuery
                                })
                            ],
                            or: true
                        }));
                }
                this._oEntity1ValueHelpDialog.getBinding("items").filter(aFilter);
            }





        });
    }
);
