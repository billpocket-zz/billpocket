//Singleton Pattern
var App = {
		ViewModels: {},
		Models: {},
		DataSource: {}
	},

	//ShortHands
	EMAIL_RGEX = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
	NOT_VALID_EMAIL_MSG = 'Compruebe su direcci\u00F3n email',
	TEST_USER = 'test@billpocket.com',
	TEST_PASS = '123',

	//Mensajes
	appMessages = [{
		code: '752',
		type: 'error',
		text: 'El usuario no existe'
	}];

/**
 * Modelo de la vista del formulario de Login
 * @method LoginFormViewModel
 * @return
 */
var LoginFormViewModel = function () {
	var self = this;
	//ATTRS
	self.username = ko.observable('');
	self.password = ko.observable('');
	self.message = ko.observable('');

	self.disableLoginButtonState = ko.computed(function () {
		var emailValidation = false,
			result = true;
		if (self.username() !== '' && self.password() !== '') {
			emailValidation = self.emailValidation(self.username());
			if (emailValidation) {
				self.message('');
				result = false;

			} else {
				self.message(NOT_VALID_EMAIL_MSG);
			}
		}
		return result;

	}, this);

	/**
	 * Validacion de el email
	 * @method emailValidation
	 * @param {} email
	 * @return Literal
	 */
	self.emailValidation = function (email) {
		var expr = EMAIL_RGEX;
		if (!expr.test(email)) {
			return false;
		}
		return true;
	};

	/**
	 * Se ejecuta cuando el usuario presiona el boton de autenticacion
	 * @method loginAction
	 * @return
	 */
	self.loginAction = function () {
		var requestParams = {
			username: self.username(),
			password: self.password()
		};

		App.DataSource.UserDataSource.loginRequest(requestParams, function (response) {
			if (response.message) {
				self.message(response.message.text);
			}
		});
	};

	/**
	 * Constructor de la clase
	 * @method init
	 * @return
	 */
	self.init = function () {};

	self.init();
};

App.ViewModels.LoginFormViewModel = LoginFormViewModel;

/**
 * Clase que encapsula la logica de un modelo de usuario
 * @method UserModel
 * @param {} username
 * @param {} password
 * @return
 */
var UserModel = function (username, password) {
	var self = this;

	//ATTRS
	self.username = ko.observable('username');
	self.password = ko.observable('password');

	/**
	 * Description
	 * @method init
	 * @return
	 */
	self.init = function () {};

	self.init();
};

App.Models.UserModel = UserModel;

/**
 * Clase que encapsula la logica de Entrada/Salida de la entidad usuario
 * @method UserDataSource
 * @return
 */
var UserDataSource = (function () {
	return {
		/**
		 * Se ejecuta cuando se ra
		 * @method loginRequest
		 * @param {} params
		 * @param {} callback
		 * @return
		 */
		loginRequest: function (params, callback) {
			var responseData = {
				message: appMessages[0]
			},
				expr;

			//Simulating Data
			if (params.username === TEST_USER && params.password === TEST_PASS) {
				//redirec to another page
				window.location.href = '../../modules/transacciones';
			} else {
				expr = EMAIL_RGEX;
				if (!expr.test(params.username)) {
					responseData.message.text = NOT_VALID_EMAIL_MSG;
				}
				//return error message
				callback(responseData);

			}

		}
	};
}());

App.DataSource.UserDataSource = UserDataSource;

ko.applyBindings(new App.ViewModels.LoginFormViewModel());
