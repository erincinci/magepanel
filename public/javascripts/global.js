/**
 * Created by erincinci on 7/9/14.
 */
// Data
var codeMirror = null;

// DOM Ready =============================================================
$(document).ready(function() {

    /**
     * Render select picker components
     */
    $('.selectpicker').selectpicker({
        'selectedText': 'cat'
    });

    /**
     * Ajax Loading Panel
     */
    $(document).ajaxStart(function(){
        $("#overlay").show();
        $("#wait").css("display","block");
    });
    $(document).ajaxComplete(function(){
        $("#overlay").hide();
        $("#wait").css("display","none");
    });

    /**
     * Console Button click events
     */
    $("#mageinfo").click(function() {
        appendToConsole('version');
    });
    $("#mageEnvs").click(function() {
        appendToConsole('list environments');
    });

    /**
     * Check if notification needs to be shown
     * @type {*|Array|{index: number, input: string}|string}
     */
    var setupStatus = getParameterByName('status');
    if(typeof setupStatus !== 'undefined' & setupStatus == 'incomplete') {
        toastr.warning('Application is need to be setup..', 'MagePanel');
    } else if(typeof setupStatus !== 'undefined' & setupStatus == 'complete') {
        toastr.success('Settings saved', 'MagePanel Setup');
    }

    /**
     * Submit setup form
     */
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

    /**
     * Submit add project form
     */
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
                $('#projectDetail').html("Select a project..");
                toastr.success(result["message"], 'MagePanel Projects');
            }
        }).error(function() {
            toastr.error('Something went wrong ', 'MagePanel Projects');
        });
    });

    /**
     * Submit edit project environment form
     */
    $('#editEnvForm').submit(function(event) {
        event.preventDefault();
        codeMirror.toTextArea();
        codeMirror = null;
        var formData = $(this).serialize();

        $.post( '/projects/saveEnvFile', formData, function(result) {
            // Check if we have warning
            if(result["warn"]) {
                toastr.warning(result["message"], 'MagePanel Projects');
            } else {
                $('#editEnvModal').modal('hide');
                $('#projectsList').load(document.URL +  ' #projectsList');
                $('#projectDetail').html("Select a project..");
                toastr.success(result["message"], 'MagePanel Projects');
            }
        }).error(function() {
            toastr.error('Something went wrong ', 'MagePanel Projects');
        });
    });

    /**
     * Project list group item on select action
     */
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

    // Destroy CodeMirror if it exists
    if (codeMirror != null) {
        codeMirror.toTextArea();
        codeMirror = null;
    }
});
$('#editEnvModal').on('show.bs.modal', function () {
    $('.modal .modal-body').css('overflow-y', 'auto');
    $('.modal .modal-body').css('max-height', $(window).height() * 0.9);
});

// DOM Change ============================================================
/**
 * Browse file Input JS
 */
$(document).on('change', '.btn-file :file', function() {
    var input = $(this),
        label = input.val();//.replace(/\\/g, '/').replace(/.*\//, '');
    $('#projectDir').val(label);
});

/**
 * Delete project button onClick
 */
$('#delProjectBtn').on('click', function() {
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
            $('#projectDetail').html("Select a project..");
            toastr.success(result["message"], 'MagePanel Projects');
        }
    }).error(function() {
        toastr.error('Something went wrong ', 'MagePanel Projects');
    });
});

// Functions =============================================================
/**
 * Append output to console
 * @param cmd
 */
function appendToConsole(cmd) {
    var selectedItem = $('#activeProject').find(":selected").val();
    // Cancel if selection is not valid
    if (selectedItem == 'null') {
        toastr.warning("Please select an active project", 'MagePanel Console');
        return;
    }

    // jQuery AJAX call for output data
    $.get( '/mage/command?cmd=' + cmd + '&id=' + selectedItem, function(output) {
        $('#console').html($('#console').html() + "<br>" + output);
    });
};

/**
 * Get URL query parameter by name
 * @param name
 * @returns {*|Array|{index: number, input: string}|string}
 */
function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
};

/**
 * Environments list item onClick event
 * @param ymlFile
 */
function envListItemOnClick(ymlFile, orgFile) {
    $.ajax({
        url : ymlFile.replace('public',''),
        dataType: "text",
        success : function (data) {
            // Set hidden input value
            $("#orgFile").val(orgFile);

            // Set code to textarea
            $("textarea#code").val(data);

            // Convert textarea to CodeMirror editor
            codeMirror = CodeMirror.fromTextArea(document.getElementById("code"), {
                lineNumbers: true,
                styleActiveLine: true,
                tabMode: 'spaces',
                theme: 'mdn-like'
            });

            // Show modal window
            $('#editEnvModal').modal('show');
            // TODO: CodeMirror instance not drawn correctly until focused (Problematic together with jQuery)
            codeMirror.refresh();
            codeMirror.focus();
        },
        error : function () {
            toastr.error("There was an error while opening environment file", 'MagePanel Projects');
        }
    });
};