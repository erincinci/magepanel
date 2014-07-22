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
    $('#saveSettingsForm').submit(function(event) {
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

    // Submit add project form
    $('#addProjectForm').submit(function(event) {
        event.preventDefault();
        var formData = $(this).serialize();

        $.post( '/projects/add', formData, function(result) {
            // Check if we have warning
            if(result["warn"]) {
                toastr.warning(result["message"], 'MagePanel Projects');
            } else {
                $('#addProjectModal').modal('hide');
                $('#projectsList').load(document.URL +  ' #projectsList');
                toastr.success(result["message"], 'MagePanel Projects');
            }
        }).error(function() {
            toastr.error('Something went wrong ', 'MagePanel Projects');
        });
    });

    // Project list group item on select action
    $(document).delegate('.list-group-item', 'click', function(e) {
        var previous = $(this).closest(".list-group").children(".active");
        previous.removeClass('active'); // previous list-item
        $(e.target).addClass('active'); // activated list-item

        // jQuery AJAX call for project detail
        $.get( '/projects/detail?id=' + e.target.id, function(output) {
            $('#projectDetail').html(output);
        });
    });
});

// Modal Functions =======================================================
$('.modal').on('hidden.bs.modal', function(){
    $(this).find('form')[0].reset();
});

// DOM Change ============================================================
// Browse file Input JS
$(document).on('change', '.btn-file :file', function() {
    var input = $(this),
        label = input.val();//.replace(/\\/g, '/').replace(/.*\//, '');
    $('#projectDir').val(label);
});

// Delete project button onClick
$('#delProjectBtn').on('click', function(e) {
    var selectedItem = $('.list-group-item.active')[0];

    // Cancel if selection is not valid
    if (selectedItem == null)
        return

    // jQuery AJAX call for project deletion
    $.post( '/projects/delete?id=' + selectedItem.id, function(result) {
        // Check if we have warning
        if(result["warn"]) {
            toastr.warning(result["message"], 'MagePanel Projects');
        } else {
            $('#projectsList').load(document.URL +  ' #projectsList');
            // TODO: Reset project details div
            toastr.success(result["message"], 'MagePanel Projects');
        }
    }).error(function() {
        toastr.error('Something went wrong ', 'MagePanel Projects');
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