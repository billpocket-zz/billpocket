//Singleton Pattern
var App = {
	    ViewModels: {},
	    Models: {},
	    DataSource: {},
	    Views: {}
	},
    //ShortHands
    TRANSACTION_DATASOURCE_URL = "https://www.billpocket.com/webappfake/index.php/test/get_test",
    VENTA = 'venta',
    VISA_IMG = '<img src="assets/images/visa.png"/>  ',
    MASTERCARD_IMG = '<img src="assets/images/mastercard.png"/>  ',
    TIME_ICON_HTML = '<span class="glyphicon glyphicon-time"></span>',
    OK_ICON_HTML = '<span class="glyphicon glyphicon-ok"></span>',
    NO_HAY_RESULTADOS = 'No hay resultados que coincidan el filtro.';

/**
 * Lista Modelos de tipo Transaccion
 * @param {} data
 * @param {} dt
 * @return
 */
var TransactionCollectionModel = function (data) {
    var self = this;

    //Attrs
    self.collection = [];
    self.type = data.type || VENTA;

    /**
     * Llena el modelo con un datasource
     * @method read
     * @param {} callback
     * @return
     */
    self.read = function (callback) {
        if (self.collection.length < 1) {
            TransactionCollectionDataSource.getTransactionCollectionRequest({
                    tipotransaccion: self.type
                },
                function (response) {
                    var transacciones = response.transacciones,
                        size = transacciones.length,
                        i = 0;

                    for (i; i < size; i++) {
                        self.collection.push(transacciones[i]);
                    }
                    callback(self);
                }
            );
        }
    };
};

App.Models.TransactionCollectionModel = TransactionCollectionModel;

/**
 * Interfaz de Entrada/Salida para los modelos de transacciones
 * @return
 */
var TransactionCollectionDataSource = (function () {
    return {
        /**
         * Description
         * @method getTransactionCollectionRequest
         * @param {} params
         * @param {} callback
         * @return
         */
        getTransactionCollectionRequest: function (params, callback) {
            var tipotransaccion = params.tipotransaccion || VENTA;
            $.ajax({
                type: "GET",
                url: TRANSACTION_DATASOURCE_URL,
                data: {
                    tipotransaccion: tipotransaccion
                },
                dataType: "json",
                success: callback
            });
        }
    };
}());

App.DataSource.TransactionCollectionDataSource = TransactionCollectionDataSource;


/**
 * ModeloVista Principal de la Aplicacion es el equivalente a un Controlador
 * @param {} data
 * @return
 */
var TransactionCollectionViewModel = function (data) {
    var self = this;

    //ATTRS
    self.datatable = data.datatable || {};

    /**
     * Constructor de la clase
     * @method init
     * @param {} data
     * @return
     */
    self.init = function (data) {
        var TransactionCollectionModel = App.Models.TransactionCollectionModel;

        //Se inicializan los 2 modelos
        self.devolucionModel = new TransactionCollectionModel({
            type: 'devolucion'
        });
        self.ventasModel = new TransactionCollectionModel({
            type: VENTA
        });

        //Se muestran las devoluciones por defecto
        self.showTransactionCollection(self.devolucionModel, data.callback);
        self.activeTypo = ko.observable(0);
    };

    /**
     * Contiene la logica que permite sincronizar la vista con un modelo
     * @method showTransactionCollection
     * @param {} model Transaccion
     * @param {} callback
     * @return
     */
    self.showTransactionCollection = function (model, callback) {
        var modelCollection = model.collection;

        if (modelCollection.length === 0) {

            //Se usa la filosofia de un patron proxy
            model.read(function (model) {
                self.syncView(model.collection, callback);
            });
        } else {
            self.syncView(model.collection, callback);
        }
    };

    /**
     * Sincroniza la tabla de datos con una colleccion de transacciones
     * @method syncView
     * @param {} collection
     * @param {} callback
     * @return
     */
    self.syncView = function (collection, callback) {
        var datatable = self.datatable,
            size = collection.length,
            i = 0;

        datatable.clear();

        for (i; i < size; i++) {
            var temp = new TransactionViewModel(collection[i]);
            datatable.row.add(temp).draw();
        }

        //TODO: Debe validarse que sea una funcion
        if (callback) {
            callback();
        }

    };

    /**
     * Muestra las transacciones de tipo venta
     * @method showVentasAction
     * @return
     */
    self.showVentasAction = function () {
        self.activeTypo(1);
        self.toogleFiltersHelper(self.ventasModel);

    };

    /**
     * Muestra las transacciones de tipo devolucion
     * @method showDevolucionesAction
     * @return
     */
    self.showDevolucionesAction = function () {
        self.activeTypo(0);
        self.toogleFiltersHelper(self.devolucionModel);
    };

    /**
     * Animacion que es ejecutada cuando se intercambia de filtro
     * @method toogleFiltersHelper
     * @param {} model
     * @return
     */
    self.toogleFiltersHelper = function (model) {
        var tableHtmlNode = $('#example');

        tableHtmlNode.fadeTo(1000, 0.5, function () {});
        self.showTransactionCollection(model, function () {
            tableHtmlNode.stop().fadeTo(1000, 1.0, function () {});
        });

    };

    /**
     * Limpia el filtro activo
     * @method clearFilterAction
     * @return
     */
    self.clearFilterAction = function () {
        $('#example').dataTable().fnFilter('');
        $('#example_filter input').val('');
    };

    /**
     * Se ejecuta el cierre de sesion
     * @method logoutAction
     * @return
     */
    self.logoutAction = function () {
        window.location.href = '../../modules/login';
    };

    self.init(data);
};

App.ViewModels.TransactionCollectionViewModel = TransactionCollectionViewModel;

/**
 * Modelo de la vista de una transaccion
 * @method TransactionViewModel
 * @param {} data
 * @param {} dt
 * @return
 */
var TransactionViewModel = function (data, dt) {
    var self = this,
        observableProperties = [
            'idtransaccion',
            'fechahora',
            't2m',
            'tipotarjeta',
            'monto',
            'tipotransaccion',
            'etiqueta',
            'dispersion',
        ],
        propertyKey;

    //Seteando valores de los atributos
    for (var i = 0; i < observableProperties.length; i++) {
        propertyKey = observableProperties[i];
        self[propertyKey] = ko.observable(data[propertyKey]);
    }

    self.formatedMonto = ko.computed({
        read: function () {
            return '$' + self.monto();
        }
    }, self);

    self.formatedTarjeta = ko.computed({
        read: function () {
            var result = '',
                t2mSplit = self.t2m().split('=')[0];

            if (self.tipotarjeta() === 'Visa') {
                result = VISA_IMG;
            } else {
                result = MASTERCARD_IMG;
            }
            result += t2mSplit;
            return result;
        }
    }, self);

    self.formatedDispersion = ko.computed({
        read: function () {
            var dispersion = self.dispersion(),
                htmlValue = TIME_ICON_HTML;

            if (dispersion == 1) {
                htmlValue = OK_ICON_HTML;
            }
            return htmlValue;
        }
    }, self);

};

$(document).ready(function () {

    /**
     * Inicializa los componentes principales de la interfaz
     * @method initializeUI
     * @return
     */
    App.initializeUI = function () {

        App.Views.Datatable = $('#example').DataTable({
            columns: [{
                data: 'idtransaccion()'
            }, {
                data: 'fechahora()'
            }, {
                data: 'formatedTarjeta()'
            }, {
                data: 'formatedMonto()'
            }, {
                data: 'tipotransaccion()'
            }, {
                data: 'etiqueta()'
            }, {
                data: 'formatedDispersion()'
            }],
            bSort: false,
            bPaginate: false,
            bInfo: false,
            "oLanguage": {
                "sSearch": '',
                "sZeroRecords": NO_HAY_RESULTADOS
            },
            oClasses: {
                sFilterInput: 'input-sm form-control',
                sFilterPlaceholder: 'Filtrar',
                sFilter: 'container dataTables_filter'
            }
        });

        var smartFilterhtml = '<div class="col-lg-4 col-md-4 col-sm-4 col-xs-4">' +
            '<div class="btn-group btn-group-sm">' +
            '<button type="button" class="btn btn-sm" data-bind="click: showVentasAction, css: { \'btn-default\': activeTypo() < 1, \'btn-primary\': activeTypo() > 0 }"><span class="hidden-xs">Ventas</span><span class="visible-xs glyphicon glyphicon-euro"></span></button>' +
            '<button type="button" class="btn btn-sm" data-bind="click: showDevolucionesAction, css: { \'btn-primary\': activeTypo() < 1, \'btn-default\': activeTypo() > 0 }"><span class="hidden-xs">Devoluciones</span><span class="visible-xs glyphicon glyphicon-transfer"></span></button>' +
            '</div>' +
            '</div>';

        $('#example_filter').append(smartFilterhtml);
    };

    /**
     * Se ejecuta cuando se terminan de cargar las primeras transacciones
     * @method opening
     * @return
     */
    App.opening = function () {
        $(".loader").fadeOut(1000, function () {
            $(".content-body").removeClass("hidden");
            $(".content-body").fadeIn(1000, function () {});
        });
    };

    App.initializeUI();
    var transactionCollectionViewModel = new App.ViewModels.TransactionCollectionViewModel({
        datatable: App.Views.Datatable,
        callback: App.opening
    });

    ko.applyBindings(transactionCollectionViewModel);
});