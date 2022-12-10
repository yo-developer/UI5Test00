sap.ui.define(
    ["../BaseController",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageToast",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/core/Fragment"
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageToast, Filter, FilterOperator, Fragment) {
        "use strict";

        return Controller.extend("yo.test.controller.entity2.Entity2List", {

            MODEL_LOCAL_NAME: "local",
            MODEL_ENTITY2_NAME: "entity",
            ROUTE_DETAIL: "Entity2Detail",
            FRAGMENT_CREATE_NAME: "yo.test.view.entity2.Entity2Create",
            FRAGMENT_ENTITY1_VALUE_HELP_NAME: "yo.test.view.entity1.Entity1ValueHelp",

            onInit: function () {

                this._oCreateDialog = null;
                this._oEntity1ValueHelpDialog = null;

                this._oLocalModel = new JSONModel({
                    entity2: null,
                    busy: false,
                    associations: {
                        entity1: null
                    }
                });
                this.setModel(this._oLocalModel, this.MODEL_LOCAL_NAME);
                this._setDefaultValues();
            },

            onPressCreateButton: function (oEvent) {
                this._showCreateDialog();
            },

            onSearchAllSearchField: function (oEvent) {
                this._search(oEvent.getParameter("query"));
            },

            onPressColumnListItem: function (oEvent) {
                this._navigate(oEvent.getSource());
            },

            onPressDeleteButton: function (oEvent) {
                this._delete(oEvent.getSource().getParent());
            },

            onPressCreateDialogSaveButton: function (oEvent) {
                this._createSave();
            },

            onPressCreateDialogCancelButton: function (oEvent) {
                this._createCancel();
            },


            _search: function (sQuery) {
                // build filter array
                var aFilter = [];
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
                // filter binding
                var oTable = this.byId("table");
                var oBinding = oTable.getBinding("items");
                oBinding.filter(aFilter);
            },

            _navigate: function (oItem) {
                this.getRouter().navTo(this.ROUTE_DETAIL, {
                    ID: oItem.getBindingContextPath().substring("/Entity2".length)
                });
            },

            _delete: function (oItem) {
                let that = this;
                this._oLocalModel.setProperty("/busy", true);
                this.getModel(this.MODEL_ENTITY2_NAME).remove(
                    oItem.getBindingContextPath(),
                    {
                        success: function(oData, response) {
                            that._oLocalModel.setProperty("/busy", false);
                            MessageToast.show('Entit2 deleted.');
                        },
                        error: function(oError) {
                            that._oLocalModel.setProperty("/busy", false);
                            MessageToast.show('Error deleting entity2.');
                        }
                    });
            },

            _showCreateDialog: function () {
                let that = this;
                if (!this._oCreateDialog) {
                    this.loadFragment({
                        name: this.FRAGMENT_CREATE_NAME,
                        controller: this
                    }).then(function(oDialog) {
                        that._oCreateDialog = oDialog;
                        that._oCreateDialog.open();
                    });
                } else {
                    this._oCreateDialog.open();
                }
            },

            _createSave: function () {
                var that = this;
                this._oLocalModel.setProperty("/busy", true);
                this.getModel("entity").create(
                    "/Entity2", 
                    this._oLocalModel.getProperty("/entity2"),
                    {
                        success : function(oData, response) {
                            that._oLocalModel.setProperty("/busy", false);
                            that._setDefaultValues();
                            that._oCreateDialog.close();
                            MessageToast.show('Entit2 created.');
                        },
                        error : function(oError) {
                            that._oLocalModel.setProperty("/busy", false);
                            MessageToast.show('Error creating entity2.');
                        }
                    });
            },

            _createCancel: function () {
                this._setDefaultValues();
                this._oCreateDialog.close();
            },

            _setDefaultValues: function () {
                this._oLocalModel.setProperty("/entity2", this._getDefaultEntity2());
                this._oLocalModel.setProperty("/associations/entity1", null);
            },
            
            _getDefaultEntity2: function () {
                return {
                    title: null,
                    descr: null,
                    entity1_ID: null,
                }
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
