var LoginFormViewModel = function () {
    var self = this;
    //ATTRS
    self.username = ko.observable('');
    self.password = ko.observable('');
    self.message = ko.observable('');

    self.disableLoginButtonState = ko.computed(function() {
        var emailValidation = false;
            result = true;
        if(self.username() !== '' && self.password() !== ''){
            emailValidation = self.emailValidation(self.username());
            if(emailValidation){
                self.message('');
                result = false;
                
            } else {
               self.message('Compruebe su direcci\u00F3n email'); 
            }
        }
        return result;

    }, this);

    self.emailValidation = function(email){
        var expr = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if ( !expr.test(email) ){
            return false;
        }
        return true;
    },
 
    self.loginAction = function(){
        console.log('syncLoginButton');

        var requestParams = {
            username: self.username(),
            password: self.password()
        } 

        App.DataSource.UserDataSource.loginRequest(requestParams, function (response) {
            console.log(response);
            if(response.message){
                self.message(response.message.text);    
            }
        });
    };
 
    self.init = function () {
    };
 
    self.init();
};

App.ViewModels.LoginFormViewModel = LoginFormViewModel;

var UserModel = function (username, password) {
    var self = this;

    //ATTRS
    self.username = ko.observable('username');
    self.password = ko.observable('password');

    self.init = function () {
    };
 
    self.init();
};

App.Models.UserModel = UserModel;

var UserDataSource = (function () { 
    return { 
        loginRequest: function (params,callback) {
            var responseData = {
                    message: {
                        code: '752',
                        type: 'error',
                        text: 'El usuario no existe'
                    }
                },
                expr;

            //Simulating Data
            if(params.username === 'test@billpocket.com' && params.password === '123'){
                //redirec to another page
                window.location.href = '../../transacciones/index.html';
            } else {
                var expr = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                if ( !expr.test(params.username) ){
                    responseData.message.text = 'Compruebe su direccion email'
                }
                //return error message
                callback(responseData);

            }

            //Real life example
            // $.ajax({ 
            //     type: "POST", 
            //     url: "/api/login", 
            //     contentType: "application/json;charset=utf-8", 
            //     dataType: "json", 
            //     success: callback 
            // }); 
        } 
    }; 
} ());

App.DataSource.UserDataSource = UserDataSource;
