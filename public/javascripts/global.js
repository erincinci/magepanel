/**
 * Created by erincinci on 7/9/14.
 */
// Data
var codeMirror = null;

// DOM Ready =============================================================
$(document).ready(function() {
    $('[rel=tooltip]').tooltip();

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
        $("#ajaxloader").show();
        $("#wait").css("display","block");
    });
    $(document).ajaxComplete(function(){
        $("#overlay").hide();
        $("#ajaxloader").hide();
        $("#wait").css("display","none");
        $('[rel=tooltip]').tooltip();
    });

    /**
     * Console Button click events
     */
    $("#clearConsole").click(function() {
        $('#console').html("<span class='console-pointer'>&gt;&gt; </span><i>Ready..</i>");
    });
    $("#mageinfo").click(function() {
        appendToConsole('version');
    });
    $("#mageReleases").click(function() {
        appendToConsole('releases list to:staging'); //TODO
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
     * Submit edited project file form
     */
    $('#editFileForm').submit(function(event) {
        event.preventDefault();
        codeMirror.toTextArea();
        codeMirror = null;
        var formData = $(this).serialize();

        $.post( '/projects/saveFile', formData, function(result) {
            // Check if we have warning
            if(result["warn"]) {
                toastr.warning(result["message"], 'MagePanel Projects');
            } else {
                $('#editFileModal').modal('hide');
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
    $(document).delegate('#projectsList .list-group-item', 'click', function(e) {
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
$('#editFileModal').on('shown.bs.modal', function () {
    // Adjust EditEnv Modal Size
    $('#editFileModal .modal-body').css('overflow-y', 'auto');
    $('#editFileModal .modal-body').css('height', $(window).height() * 0.7);

    // Resize & Refresh & Focus CodeMirror Editor
    codeMirror.setSize('100%', '100%');
    codeMirror.refresh();
    codeMirror.focus();
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
    if (selectedItem == null) {
        toastr.warning("Select a project first", 'MagePanel Projects');
        return;
    }

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

/**
 * Refresh project button onClick
 */
$('#refreshProjectBtn').on('click', function(event) {
    var selectedItem = $('.list-group-item.active')[0];

    // Cancel if selection is not valid
    if (selectedItem == null) {
        toastr.warning("Select a project first", 'MagePanel Projects');
        return;
    }

    // jQuery AJAX call for project refresh
    $.post( '/projects/refresh?id=' + selectedItem.id, function(result) {
        // Check if we have warning
        if(result["warn"]) {
            toastr.warning(result["message"], 'MagePanel Projects');
        } else {
            $('#projectsList').load(document.URL +  ' #projectsList');
            $('#projectDetail').html("Select a project..");
            selectedItem.addClass('active');
            toastr.success(result["message"], 'MagePanel Projects');
        }
    }).error(function() {
        toastr.error('Something went wrong ', 'MagePanel Projects');
    });
});

// Functions =============================================================
/**
 * Capitalize String
 * @returns {string}
 */
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

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
 * load environments of selected project
 */
function loadEnvs() {
    var selectedItem = $("#activeProject").val();
    var i;
    if (selectedItem == 'null') {
        $('#activeEnvironment').prop('disabled',true);
        $("#activeEnvironment option[value !='null']").remove();
        $('#activeEnvironment').selectpicker('refresh');
        return false;
    }

    // jQuery AJAX call to load environments
    $.get( '/projects/envs?id=' + selectedItem, function(result) {
        // Check if we have warning
        if(result == null) {
            toastr.warning("Couldn't get environments of selected project!", 'MagePanel Console');
        } else {
            $("#activeEnvironment option[value !='null']").remove();
            for (i =0; i< result.length;++i) {
                $("#activeEnvironment").append("<option>"+result[i]+"</option>");
            }
            $('#activeEnvironment').prop('disabled',false);
            $('#activeEnvironment').selectpicker('refresh');
        }
    }).error(function() {
        toastr.error('Something went wrong ', "Couldn't get environments of selected project!");
    });
}

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
 * @param orgFile
 * @param envName
 */
function envListItemOnClick(ymlFile, orgFile, envName) {
    $.ajax({
        url : ymlFile.replace('public',''),
        dataType: "text",
        success : function (data) {
            // Set hidden input value & Change modal title
            $("#orgFile").val(orgFile);
            $("#editFileModalLabel").html("Edit '<strong>" + envName.capitalize() + "</strong>' Environment");

            // Set code to textarea
            $("textarea#code").val(data);

            // Convert textarea to CodeMirror editor
            codeMirror = CodeMirror.fromTextArea(document.getElementById("code"), {
                lineNumbers: true,
                lineWrapping: true,
                styleActiveLine: true,
                tabMode: 'spaces',
                theme: 'mdn-like',
                mode: 'yaml'
            });

            // Show modal window
            $('#editFileModal').modal('show');
        },
        error : function () {
            toastr.error("There was an error while opening environment file", 'MagePanel Projects');
        }
    });
};

/**
 * Custom Tasks list item onClick event
 * @param phpFile
 * @param orgFile
 * @param taskName
 */
function taskListItemOnClick(phpFile, orgFile, taskName) {
    $.ajax({
        url : phpFile.replace('public',''),
        dataType: "text",
        success : function (data) {
            // Set hidden input value & Change modal title
            $("#orgFile").val(orgFile);
            $("#editFileModalLabel").html("Edit '<strong>" + taskName.capitalize() + "</strong>' Task");

            // Set code to textarea
            $("textarea#code").val(data);

            // Convert textarea to CodeMirror editor
            codeMirror = CodeMirror.fromTextArea(document.getElementById("code"), {
                lineNumbers: true,
                lineWrapping: true,
                styleActiveLine: true,
                matchBrackets: true,
                theme: 'mdn-like',
                mode: 'php'
            });

            // Show modal window
            $('#editFileModal').modal('show');
        },
        error : function () {
            toastr.error("There was an error while opening task file", 'MagePanel Projects');
        }
    });
};