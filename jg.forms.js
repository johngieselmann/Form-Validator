/**
 * The form validating js example.
 *
 * @author JohnG <john.gieselmann@upsync.com>
 */
(function(window, document, $, undefined) {

    /**
     * The one class to rule them all.
     *
     * @author JohnG <john.gieselmann@upsync.com>
     */
    var app = {

        /**
         * Where to submit the form.
         * @var str submitUrl
         */
        submitUrl: null,

        /**
         * Initialize what needs to happen for the app.
         *
         * @author JohnG <john.gieselmann@upsync.com>
         *
         * @return void
         */
        init: function(url) {

            // set the url to which the form should be submitted, if one
            // was not passed in, default to our current location
            app.submitUrl = url || window.location.href;

            // bring in the form class
            app.form = form;
            app.form.init($(".js-form-validate"));

            // bind events
            app.bindEvents();
        },

        /**
         * Bind the events associated with app.
         *
         * @author JohnG <john.gieselmann@upsync.com>
         */
        bindEvents: function() {
            $(".js-ex-submit").on("click", app.submit);
        },

        /**
         * Try to submit the form.
         *
         * @author JohnG <john.gieselmann@upsync.com>
         *
         * @param obj e The event object passed in by jquery.
         */
        submit: function(e) {

            // prevent the form from submitting
            e.preventDefault();

            // validate the form first
            var valid = app.form.validateInputs();
            if (!valid) {
                app.form.showInvalids();
                return false;
            }

            // the form is valid, let's get the data
            $.ajax({
                url:  app.submitUrl,
                type: "POST",
                data: {
                    "app_input": app.form.serialize()
                },
                dataType: "json",
                success: function(result) {
                    // successful callback
//                    if (!parseInt(result.error)) {
                        $("#getstartedoverlay").click();
//                    }
                },
                error: function(jqXHR, textStatus) {
                    console.log(textStatus);
                    console.log(jqXHR);
                }
            });
        }
    };

    /**
     * This class handles form fun.
     *
     * @author JohnG <john.gieselmann@upsync.com>
     */
    var form = {

        /**
         * Store the form element. This class will not work without it.
         * @var jqObj el
         */
        el: null,

        /**
         * Store the form inputs for using throughout the class.
         * @var jqObj inputs
         */
        inputs: null,

        /**
         * Keep track of the invalid inputs for displaying later. You can see
         * an example of how to format the object in the definition.
         * @var obj invalids
         */
        invalids: {
//            "#selector": {
//                "message": "What is wrong with the input"
//            }
        },

        /**
         * Initialize the form class.
         *
         * @author JohnG <john.gieselmann@upsync.com>
         *
         * @param jqobj formEl The form element on which this class is being used.
         *
         * @return void
         */
        init: function(formEl) {
            form.el = formEl;
            form.captureElements();
            form.bindEvents();

            // set the default placeholders
            form.inputs.each(function() {
                form.setPlaceholder(null, $(this));
            });

        },

        /**
         * Capture the form elements
         *
         * @author JohnG <john.gieselmann@upsync.com>
         *
         * @return void
         */
        captureElements: function() {
            form.inputs = form.el.find("input:not([type='submit']), textarea, select");
        },

        /**
         * Bind events for the form.
         *
         * @author JohnG <john.gieselmann@upsync.com>
         *
         * @return void
         */
        bindEvents: function() {
            form.inputs.on("focus blur", form.setPlaceholder);

            // validate on blur
            form.inputs.on("blur", function() {
                form.validateInputs(null, $(this));
            });

            // clear invalidities on focus
            form.inputs.on("focus", function() {
                form.clearInvalid(null, $(this));
            });
        },

        /**
         * Adjust the value placeholders for the input fields
         *
         * @author JohnG <john.gieselmann@upsync.com>
         *
         * @return void
         */
        setPlaceholder: function(e, el) {

            // get the input and the default placeholder
            var $input = el || $(this);
            var placeholder = $input.attr("data-placeholder");

            // flag whether or not this is a textarea so we can properly
            // assign the values
            var textarea = false;

            // get the proper value according to the type of tag
            switch ($input.prop("tagName")) {
                case "INPUT":
                    var val = $.trim($input.val());
                    break;

                case "TEXTAREA":
                    var val = $.trim($input.text());
                    textarea = true;
                    break;
            }

            // adjust the value displayed in the input according to
            // what we find as the current value
            if (val == placeholder) {

                if (textarea) {
                    $input.text("");
                } else {
                    $input.val("");
                }

            } else if (val == "") {

                if (textarea) {
                    $input.text(placeholder);
                } else {
                    $input.val(placeholder);
                }

            }
        },

        /**
         * Validate the inputs of a form.
         *
         * @author JohnG <john.gieselmann@upsync.com>
         *
         * @param obj e The event object from jQuery.
         *
         * @param jqObj el The optional element(s) to validate instead
         * of all the form inputs.
         *
         * @return bool Whether or not all inputs passed validation.
         */
        validateInputs: function(e, el) {

            // ensure that we have assigned the form to the class
            if (!form.el) {
                console.log("There is no form assigned to this class.");
                return false;
            }

            // set the proper inputs to validate
            var $inputs = el || form.inputs;

            // reset the invalid inputs and set the return variable
            form.invalids = {};
            var valid = true;

            // grab the inputs for the form and validate each of them
            $inputs.each(function(i) {

                // set the input and some of it's standard data we need
                var $input = $(this);
                var val = $.trim($input.val());
                var type = $input.attr("data-validate");
                var placeholder = $input.attr("data-placeholder");
                var required = $input.is(".js-required");

                // keep track of how to display any error messages
                var empty = false, invalid = false, message = false;

                if (!type) {
                    return true;
                }

                switch (type) {

                    case "email":
                        // if it is required, check that it has the value and that
                        // the value is valid
                        if (required && (!val || val == placeholder)) {

                            empty = true;

                        } else if (val && val != placeholder) {

                            // if it is not required or there is a value that is not
                            // the placeholder, validate
                            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                            if (!re.test(val)) {
                                invalid = true;
                            }

                        }
                        break;

                    case "phone":
                        // if it is required, check that it has the value and that
                        // the value is valid
                        if (required && (!val || val == placeholder)) {

                            empty = true;

                        } else if (val && val != placeholder) {

                            // if it is not required, but there is a value that is not
                            // the placeholder, validate
                            var digits = val.replace(/[^0-9]/g, "");
                            var re = /^\d{10}$/;
                            if (!digits || !re.test(digits)) {
                                invalid = true;
                            }

                        }
                        break;

                    case "number":
                        // if it is required, check that it has the value and that
                        // the value is valid
                        if (required && (!val || val == placeholder)) {

                            empty = true;

                        } else if (val && val != placeholder) {

                            // if it is not required, but there is a value that is not
                            // the placeholder, validate
                            var digits = val.replace(/[^0-9]/g, "");
                            var re = /^\d+$/;
                            if (!digits || !re.test(digits)) {
                                invalid = true;
                            }

                        }
                        break;

                        break;

                    case "name":
                        // names must be required to fail on no value
                        if (required && (!val || val == placeholder)) {
                            empty = true;
                        }
                        break;

                    case "text":
                    case "textarea":
                        // text must be required to fail on no value
                        if (required && (!val || val == placeholder)) {
                            empty = true;
                        }
                        break;

                    case "select":
                        // select must be required to fail on no value
                        if (required && (!val || val == placeholder)) {
                            empty = true;
                        }
                        break;
                }

                // populate the invalids object
                if (empty) {
                    message = placeholder.replace("*", " Required");
                } else if (invalid) {
                    message = "Invalid " + placeholder.replace("*", "");
                }

                // ding ding ding, we have an invalid message to show
                if (message !== false) {
                    $input.val(message).addClass("invalid");

                    // set the form input to invalid
                    valid = false;
                }
            });

            return valid;
        },

        /**
         * Clear the invalid notifications for the form.
         *
         * @author JohnG <john.gieselmann@upsync.com>
         *
         * @param obj e The event object passed in by jQuery.
         *
         * @param jqObj el The optional element(s) on which to clear the validation
         * message instead of the entire form.
         *
         * @return void
         */
        clearInvalid: function(e, el) {
            var $inputs = el || form.inputs;

            $inputs.each(function() {
                var $input = $(this);

                if ($input.is(".invalid")) {
                    $input.removeClass("invalid");
                    $input.val("");
                }
            });
        },

        /**
         * Serialize the form data.
         *
         * @author JohnG <john.gieselmann@upsync.com>
         *
         * @return obj data The serialized form data.
         */
        serialize: function(e) {

            // remove all placeholder values first
            form.inputs.each(function(i) {
                var $input = $(this);
                if ($input.val() == $input.attr("data-placeholder")) {
                    $input.val("");
                }
            });

            // serialize the form data and return it
            var data = form.el.serialize();
            return data;
        }

    };

    // Initialize the app on all forms
    app.init();

})(window, document, jQuery, undefined);
