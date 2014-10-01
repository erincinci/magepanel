/**
 * Created by erincinci on 7/9/14.
 */
// Data
var codeMirror = null;
var showAjaxLoaderFlag = true;
var ajaxTimeout = 600;
var logSocket = null;
var consoleSocket = null;

// DOM Ready =============================================================
$(window).load(function() {
    // Show AJAX Loader until page fully loads
    hideAjaxLoader();
});
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
    var loadingTimeout;
    $(document).ajaxStart(function() {
        if(showAjaxLoaderFlag) {
            loadingTimeout = setTimeout(function() {
                showAjaxLoader();
            }, ajaxTimeout);
        }
    });
    $(document).ajaxComplete(function() {
        if(showAjaxLoaderFlag) {
            clearTimeout(loadingTimeout);
            hideAjaxLoader();
        }
    });

    /**
     * Console Button click events
     */
    $("#tailLatestLog").click(function() {
        // Check if any project is selected
        var selectedId = $('#activeProject').val();
        if (selectedId == 'null') {
            toastr.warning("Please select an active project first", 'MagePanel Console');
            $('#viewFileModal').modal('hide');
            return;
        }

        // Find latest log file and tail it
        if (selectedId != null) {
            $.get( '/mageLogs/projectLatestLog?id=' + selectedId, function(logJson) {
                if (logJson != 'null') {
                    if (logJson["status"] == "success") {
                        $('#viewFileModal').modal('show');
                        // TODO: Fix mixing of tail log and tail console sockets
                        tailLogFile(logJson.logFile, logJson.logDate, logJson.logTime);
                    }else{
                        toastr.warning(logJson["message"], 'MagePanel Logs');
                    }
                } else {
                    toastr.error('There was a problem getting latest log file', 'MagePanel Logs');
                }
            });
        } else {
            // Selected project ID is invalid
            toastr.error('There was a problem getting latest log file', 'MagePanel Logs');
        }
    });
    $("#clearConsole").click(function() {
        $('#console').html("<span class='console-pointer'>&gt;&gt; </span><i>Ready..</i><br>");
    });
    $("#mageinfo").click(function() {
        appendToConsole('version');
    });
    $("#mageReleases").click(function() {
        var selectedItem = $('#activeEnvironment').val();
        // Cancel if selection is not valid
        if (selectedItem == 'null') {
            toastr.warning("Please select an active environment", 'MagePanel Console');
            return;
        }

        appendToConsole('releases list to:' + selectedItem);
    });
    $("#mageDeploy").click(function() {
        var selectedItem = $('#activeEnvironment').val();
        // Cancel if selection is not valid
        if (selectedItem == 'null') {
            toastr.warning("Please select an active environment", 'MagePanel Console');
            return;
        }

        if(confirm("Do you really want to deploy to " + selectedItem + " ?")) {
            appendToConsole('deploy to:' + selectedItem);
        }
    });
    $("#mageRollback").click(function() {
        var selectedItem = $('#activeRelease option:selected');
        var selectedItemVal = selectedItem.val();
        var selectedItemText = selectedItem.text();
        var selectedEnvironment = $('#activeEnvironment').val();
        // Cancel if selection is not valid
        if (selectedItem == 'null') {
            toastr.warning("Please select an active release", 'MagePanel Console');
            return;
        }

        if(confirm("Do you really want to rollback to " + selectedItemText + " release?")) {
            appendToConsole('releases rollback --release=' + selectedItemVal + " to:" + selectedEnvironment);
        }
    });

    /**
     * Other Button Click Events
     */
    $("#applyFileBtn").click(function() {
        // Get current form data
        var formData = {
            orgFile: $("#orgFile").val(),
            code: codeMirror.getValue()
        };

        $.post( '/projects/applyFile', formData, function(result) {
            // Check if we have warning
            if(result["warn"]) {
                toastr.warning(result["message"], 'MagePanel Projects');
            } else {
                toastr.success(result["message"], 'MagePanel Projects');
            }
        }).error(function() {
            toastr.error('Something went wrong ', 'MagePanel Projects');
        });
    });


    /**
     * Check if notification needs to be shown
     * @type {*|Array|{index: number, input: string}|string}
     */
    var setupStatus = getParameterByName('status');
    if(typeof setupStatus !== 'undefined' && setupStatus == 'incomplete') {
        toastr.warning('Application is need to be setup..', 'MagePanel');
    } else if(typeof setupStatus !== 'undefined' && setupStatus == 'complete') {
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

        addProjectToDB(formData);
    });

    /**
     * Submit edit project form
     */
    $('#editProjectForm').submit(function(event) {
        event.preventDefault();
        var formData = $(this).serialize();
        var projectId = $('.list-group-item.active')[0].id;

        // First delete old project
        $.post( '/projects/delete?id=' + projectId, function(result) {
            // Check if we have warning
            if(result["warn"]) {
                toastr.warning(result["message"], 'MagePanel Projects');
            } else {
                // No error deleting, then add edited project as new
                addProjectToDB(formData);
            }
        }).error(function() {
            toastr.error('Something went wrong ', 'MagePanel Projects');
        });
    });

    /**
     * Submit init project form
     */
    $('#initProjectForm').submit(function(event) {
        event.preventDefault();
        var formData = $(this).serialize();

        // Init mage stuff in dir first
        $.post( '/mage/init', formData, function(result) {
            // Check if we have warning
            if(result["warn"]) {
                toastr.warning(result["message"], 'MagePanel Projects');
            } else {
                $('#initProjectModal').modal('hide');
                toastr.success(result["message"], 'MagePanel Projects');

                // After successful initialization, add created mage project to DB
                addProjectToDB(formData);
            }
        }).error(function() {
            toastr.error('Something went wrong ', 'MagePanel Projects');
        });
    });

    /**
     * Submit add project environment form
     */
    $('#addProjectEnvForm').submit(function(event) {
        event.preventDefault();
        var formData = $(this).serialize();

        $.post( '/projects/addEnvFile', formData, function(result) {
            // Check if we have warning
            if(result["warn"]) {
                toastr.warning(result["message"], 'MagePanel Projects');
            } else {
                // Refresh project on success
                $('#addProjectEnvModal').modal('hide');
                $('#refreshProjectBtn').click();
                toastr.success(result["message"], 'MagePanel Projects');
            }
        }).error(function() {
            toastr.error('Something went wrong ', 'MagePanel Projects');
        });
    });

    /**
     * Submit add project task form
     */
    $('#addProjectTaskForm').submit(function(event) {
        event.preventDefault();
        var formData = $(this).serialize();

        $.post( '/projects/addTaskFile', formData, function(result) {
            // Check if we have warning
            if(result["warn"]) {
                toastr.warning(result["message"], 'MagePanel Projects');
            } else {
                // Refresh project on success
                $('#addProjectTaskModal').modal('hide');
                $('#refreshProjectBtn').click();
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
        var selectedItem = $('.list-group-item.active')[0];

        $.post( '/projects/saveFile', formData, function(result) {
            // Check if we have warning
            if(result["warn"]) {
                toastr.warning(result["message"], 'MagePanel Projects');
            } else {
                $('#editFileModal').modal('hide');
                $('#'+selectedItem.id).trigger("click");
                toastr.success(result["message"], 'MagePanel Projects');
            }
        }).error(function() {
            toastr.error('Something went wrong ', 'MagePanel Projects');
        });
    });

    /**
     * Projects - Project list group item on select action
     */
    $(document).delegate('#projectsList .list-group-item', 'click', function(e) {
        var previous = $(this).closest(".list-group").children(".active");
        previous.removeClass('active'); // previous list-item
        $(e.target).addClass('active'); // activated list-item
        $("#editProjectBtn").prop('disabled',false);
        $("#delProjectBtn").prop('disabled',false);
        $("#refreshProjectBtn").prop('disabled',false);
        // jQuery AJAX call for project detail
        $.get( '/projects/detail?id=' + e.target.id, function(output) {
            $('#projectDetail').html(output);
        });
    });

    /**
     * MageLogs - Project list group item on select action
     */
    $(document).delegate('#projectsListLogs .list-group-item', 'click', function(e) {
        var previous = $(this).closest(".list-group").children(".active");
        previous.removeClass('active'); // previous list-item
        $(e.target).addClass('active'); // activated list-item

        // jQuery AJAX call for project logs
        $.get( '/mageLogs/project?id=' + e.target.id, function(output) {
            $('#projectLogs').html(output);
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
        document.removeEventListener("keydown", CtrlSListener, false);
        $("#refreshProjectBtn").trigger("click");
    }
});
$('#editFileModal').on('shown.bs.modal', function () {
    // Adjust Edit File Modal Size
    $('#editFileModal .modal-body').css({'overflow-y': 'auto', 'height': $(window).height() * 0.7});

    // Resize & Refresh & Focus CodeMirror Editor
    codeMirror.setSize('100%', '100%');
    codeMirror.refresh();
    codeMirror.focus();

    // Capture CTRL+S key combination
    document.addEventListener("keydown", CtrlSListener, false);
});
function CtrlSListener(e) {
    if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) && $("#editFileModal").data('bs.modal').isShown) {
        e.preventDefault();
        $('#applyFileBtn').click();
    }
}
$('#editProjectModal').on('shown.bs.modal', function () {
    // Fill edit form with project data on modalShown
    var selectedItem = $('.list-group-item.active')[0];

    if (selectedItem != null) {
        $.get( '/projects/get?id=' + selectedItem.id, function(project) {
            if (project != 'null') {
                $('#projectEditId').val(project.id);
                $('#projectEditDir').val(project.dir);
                $('#projectEditName').val(project.name);
                $('#projectEditMail').val(project.mailAddress);
                var reportingEnabled = (project.reportingEnabled ? "On" : "Off");
                $('#projectEditReportingSwitch').val(reportingEnabled);
                $('#projectEditReportingSwitch').selectpicker('refresh');
            } else {
                toastr.error('There was a problem getting project details', 'MagePanel Projects');
                $('#editProjectModal').modal('hide');
            }
        });
    } else {
        // Selected project ID is invalid
        toastr.error('There was a problem getting project details', 'MagePanel Projects');
        $('#editProjectModal').modal('hide');
    }
});
$('#viewFileModal').on('shown.bs.modal', function () {
    // Adjust ViewFile Modal Size
    $('#viewFileModal .modal-body').css({'height': $(window).height() * 0.7});
    $('#logView').css({'height': $(window).height() * 0.68});
});
$('#viewFileModal').on('hidden.bs.modal', function () {
    // End file tail command on modal hidden
    logSocket.emit('exitTail', {});
});
$('#addProjectEnvModal').on('shown.bs.modal', function () {
    $('#projectIdEnv').val($('.list-group-item.active')[0].id);
});
$('#addProjectTaskModal').on('shown.bs.modal', function () {
    $('#projectIdTask').val($('.list-group-item.active')[0].id);
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

    // Confirm project deletion
    if(confirm("Are you sure to delete project?")) {
        // jQuery AJAX call for project deletion
        $.post( '/projects/delete?id=' + selectedItem.id, function(result) {
            // Check if we have warning
            if(result["warn"]) {
                toastr.warning(result["message"], 'MagePanel Projects');
            } else {
                $('#projectsList').load(document.URL +  ' #projectsList');
                $('#projectDetail').html("Select a project..");
                $("#editProjectBtn").prop('disabled',true);
                $("#delProjectBtn").prop('disabled',true);
                $("#refreshProjectBtn").prop('disabled',true);
                toastr.success(result["message"], 'MagePanel Projects');
            }
        }).error(function() {
            toastr.error('Something went wrong ', 'MagePanel Projects');
        });
    }
});

/**
 * Refresh project button onClick
 */
$('#refreshProjectBtn').on('click', function() {
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
            $('#'+selectedItem.id).trigger("click");
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
};

/**
 * Show & Hide Ajax Loader Panel
 */
function showAjaxLoader() {
    // TODO: Show loading div only on loaded part of page
    $("#overlay").show();
    $("#ajaxloader").show();
    $("#wait").css("display","block");
}
function hideAjaxLoader() {
    $("#overlay").hide();
    $("#ajaxloader").hide();
    $("#wait").css("display","none");
    $('[rel=tooltip]').tooltip();
}
function updateAjaxLoader() {
    $('#overlay').height($(document).height());
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

    // Use Socket.IO for getting live command response
    consoleSocket = io.connect();
    consoleSocket.emit('mageCommand', { cmd: cmd, id: selectedItem });
    showAjaxLoader();

    // Get live response
    var mageConsole = $('#console');
    var mageConsoleFrame = $('#consoleFrame');
    consoleSocket.on('connect', function () {
        //console.log('Connected to backend!');
        consoleSocket.on('cmdResponse', function(data) {
            switch(data.status) {
                case "stdout":
                    // Append results to console tag
                    mageConsole.append(data.result);
                    mageConsoleFrame.scrollTop(mageConsoleFrame[0].scrollHeight);
                    break;
                case "stderr":
                    // TODO: Show error in MageConsole in different style
                    break;
                case "warning":
                    // Show warning toast to user
                    toastr.warning(data.result, 'MagePanel Console');
                    break;
                case "exit":
                    hideAjaxLoader();
                    break;
            }

            // Readjust ajax loader div
            updateAjaxLoader();
        });
    });
}

/**
 * Activate command buttons
 */
function activateCommandButtons () {
    var selectedItem = $("#activeEnvironment").val();
    if (selectedItem != 'null') {
        $("#mageReleases").prop("disabled",false);
        $("#mageDeploy").prop("disabled",false);
        $("#activeRelease").prop("disabled",false);
    }else{
        $("#mageReleases").prop("disabled",true);
        $("#mageDeploy").prop("disabled",true);
        $("#activeRelease").val("null");
        $("#activeRelease").prop("disabled",true);
        $("#mageRollback").prop("disabled",true);

    }
    $('#activeRelease').selectpicker('refresh');
}

/**
 * Activate Rollback button
 */
function activateRollbackButton () {
    var selectedItem = $("#activeRelease").val();
    if (selectedItem != 'null') {
        $("#mageRollback").prop("disabled",false);
    }else{
        $("#mageRollback").prop("disabled",true);
    }
}

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
        activateCommandButtons();
        return false;
    }

    // jQuery AJAX call to load environments
    showAjaxLoaderFlag = false;
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
}

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
            $("#editFileModalLabel").html("<i class='icon ion-cloud'/> Edit '<strong>" + envName.capitalize() + "</strong>' Environment");

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
}

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
            $("#editFileModalLabel").html("<i class='icon ion-ios7-gear'/> Edit '<strong>" + taskName.capitalize() + "</strong>' Task");

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
}

/**
 * Tail log file in file viewer modal using Socket.IO
 * @param orgFile
 * @param logDate
 * @param logTime
 */
function tailLogFile(orgFile, logDate, logTime) {
    // Update UI
    $('#viewFileModalLabel').html('<i class="icon ion-document"/> Tail Log File : <i>' + logDate + " - " + logTime + "</i>");
    var logView = $('#logView');
    logView.html('');
    $('#pauseTailFileBtn').show();
    $('#resumeTailFileBtn').hide();
    showAjaxLoader();

    // Use Socket.IO for tailing log file
    logSocket = io.connect();
    logSocket.emit('tailLog', { file: orgFile, tailStatus: 'running' });

    // Get tail data from socket
    logSocket.on('connect', function () {
        logSocket.on('logTailContent', function(data) {
            hideAjaxLoader();

            // Update data or show toast according to data status
            switch(data.status) {
                case 'running':
                    logView.append(data.line).scrollTop(logView[0].scrollHeight);
                    break;
                case 'paused':
                    toastr.warning(data.line, 'MagePanel Logs');
                    break;
                case 'resumed':
                    toastr.success(data.line, 'MagePanel Logs');
                    break;
                case 'closed':
                    toastr.info(data.line, 'MagePanel Logs');
                    break;
                case 'error':
                    toastr.error(data.line, 'MagePanel Logs');
                    break;
            }
        });
    });
}

/**
 * Pause & Resume Tail file buttons onClick Events
 */
$("#pauseTailFileBtn").click(function() {
    logSocket.emit('pauseTail', {});
    $('#pauseTailFileBtn').hide();
    $('#resumeTailFileBtn').show();
});
$("#resumeTailFileBtn").click(function() {
    logSocket.emit('resumeTail', {});
    $('#pauseTailFileBtn').show();
    $('#resumeTailFileBtn').hide();
});

/**
 * Add project to DB using form data
 * @param formData
 */
function addProjectToDB(formData) {
    $.post( '/projects/add', formData, function(result) {
        // Check if we have warning
        if(result["warn"]) {
            toastr.warning(result["message"], 'MagePanel Projects');
        } else {
            $('.modal').modal('hide');
            $('#projectListContainer').load(document.URL +  ' #projectsList');
            $('#projectDetail').html("Select a project..");
            $("#editProjectBtn").prop('disabled',true);
            $("#delProjectBtn").prop('disabled',true);
            $("#refreshProjectBtn").prop('disabled',true);
            toastr.success(result["message"], 'MagePanel Projects');
        }
    }).error(function() {
        toastr.error('Something went wrong ', 'MagePanel Projects');
    });
}

/**
 * Delete project file click event
 * @param fileToDel
 */
function deleteProjectFile(fileToDel) {
    // jQuery AJAX call for project file deletion
    $.post( '/projects/deleteFile?file=' + fileToDel, function(result) {
        // Check if we have warning
        if(result["warn"]) {
            toastr.warning(result["message"], 'MagePanel Projects');
        } else {
            // Refresh project on success
            $('#refreshProjectBtn').click();
            toastr.success(result["message"], 'MagePanel Projects');
        }
    }).error(function() {
        toastr.error('Something went wrong ', 'MagePanel Projects');
    });
}
