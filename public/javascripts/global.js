/**
 * Created by erincinci on 7/9/14.
 */
// Data

// DOM Ready =============================================================
$(document).ready(function() {

    // Render select picker components
    $('.selectpicker').selectpicker({
        'selectedText': 'cat'
    });

    // Ajax Loading Panel
    $(document).ajaxStart(function(){
        $("#overlay").show();
        $("#wait").css("display","block");
    });
    $(document).ajaxComplete(function(){
        $("#overlay").hide();
        $("#wait").css("display","none");
    });

    // Console Button click events
    $("#mageinfo").click(function() {
        appendToConsole('version');
    });
    $("#mageerror").click(function() {
        appendToConsole('error');
    });

    // Check if notification needs to be shown
    var setupStatus = getParameterByName('status');
    if(typeof setupStatus !== 'undefined' & setupStatus == 'incomplete') {
        toastr.warning('Application is need to be setup..', 'MagePanel');
    } else if(typeof setupStatus !== 'undefined' & setupStatus == 'complete') {
        toastr.success('Settings saved', 'MagePanel Setup');
    }

    // Submit setup form
    $('#saveSettings').submit(function(event) {
        event.preventDefault();
        var formData = $(this).serialize();

        $.post( '/setup/save', formData, function(status) {
            //$('#content').load(document.URL + '#content');
            window.location = "/setup?status=complete";
            //toastr.success(status, 'MagePanel Setup');
        }).error(function() {
            toastr.error('Something went wrong', 'MagePanel Setup');
        });
    });
});

// Functions =============================================================

// Append output to console
function appendToConsole(cmd) {
    // jQuery AJAX call for output data
    $.get( '/mage/command?cmd=' + cmd, function(output) {
        $('#console').html($('#console').html() + "<br>" + output);
    });
};

// Get URL query parameter by name
function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
};