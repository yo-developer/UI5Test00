sap.ui.define(
    ["../BaseController",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageToast",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator"
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageToast, Filter, FilterOperator) {
        "use strict";

        return Controller.extend("yo.test.controller.entity1.Entity1List", {

            MODEL_LOCAL_NAME: "local",
            MODEL_ENTITY1_NAME: "entity",
            ROUTE_DETAIL: "Entity1Detail",
            FRAGMENT_CREATE_NAME: "yo.test.view.entity1.Entity1Create",

            onInit: function () {
                this._oLocalModel = new JSONModel({
                    entity1: this._getDefaultEntity1(),
                    busy: false
                });
                this.setModel(this._oLocalModel, this.MODEL_LOCAL_NAME);
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
                this._cereateSave();
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
                    ID: oItem.getBindingContextPath().substring("/Entity1".length)
                });
            },

            _delete: function (oItem) {
                let that = this;
                this._oLocalModel.setProperty("/busy", true);
                this.getModel(this.MODEL_ENTITY1_NAME).remove(
                    oItem.getBindingContextPath(),
                    {
                        success : function(oData, response) {
                            that._oLocalModel.setProperty("/busy", false);
                            MessageToast.show('Entit1 deleted.');
                        },
                        error : function(oError) {
                            that._oLocalModel.setProperty("/busy", false);
                            MessageToast.show('Error deleting entity1.');
                        }
                    });
            },

            _showCreateDialog: function () {
                var that = this;
                if (!this.pDialog) {
                    this.pDialog = this.loadFragment({
                        name: this.FRAGMENT_CREATE_NAME
                    });
                } 
                this.pDialog.then(function(oDialog) {
                    that.oDialog = oDialog;
                    oDialog.open();
                });
            },

            _cereateSave: function () {
                var that = this;
                this._oLocalModel.setProperty("/busy", true);
                this.getModel("entity").create(
                    "/Entity1", 
                    this._oLocalModel.getProperty("/entity1"),
                    {
                        success : function(oData, response) {
                            that._oLocalModel.setProperty("/busy", false);
                            that._oLocalModel.setProperty("/entity1", that._getDefaultEntity1());
                            that.oDialog.close();
                            MessageToast.show('Entit1 created.');
                        },
                        error : function(oError) {
                            that._oLocalModel.setProperty("/busy", false);
                            MessageToast.show('Error creating entity1.');
                        }
                    });
            },

            _createCancel: function () {
                this._oLocalModel.setProperty("/entity1", this._getDefaultEntity1());
                this.oDialog.close();
            },
            
            _getDefaultEntity1: function () {
                return {
                    title: null,
                    descr: null
                }
            }

        });
    }
);
