/**
 * Created by erincinci on 7/9/14.
 */
// Data

// DOM Ready =============================================================
$(document).ready(function() {

    // Ajax Loading Panel
    $(document).ajaxStart(function(){
        $("#overlay").show();
        $("#wait").css("display","block");
    });
    $(document).ajaxComplete(function(){
        $("#overlay").hide();
        $("#wait").css("display","none");
    });

    // Button click events
    $("#mageinfo").click(function() {
        appendToConsole('version');
    });
    $("#mageerror").click(function() {
        appendToConsole('error');
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