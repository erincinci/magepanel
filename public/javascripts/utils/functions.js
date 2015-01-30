/**
 * Created by erinci on 27.01.2015.
 */
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
 */
function appendToConsole() {
    // Check if queue is empty
    if (cmdQueue.isEmpty()) {
        toastr.warning("Command queue is empty!", 'MagePanel Console');
        return;
    }

    // TODO: Remove other sockets, use only one socket in all app!

    // Use Socket.IO for getting live command response
    var mageConsole = $('#console');
    var mageConsoleFrame = $('#consoleFrame');
    var currentCmd = cmdQueue.dequeue();
    mageConsole.append("<span class='console-pointer'>&gt;&gt; </span><b>" + currentCmd.desc + "</b><br>");
    ioSocket.emit('mageCommand', { cmd: currentCmd.cmd, id: currentCmd.projectId });
    showAjaxLoader();

    // If it is a workflow, mark the active command that is being executed
    if (currentCmd.multi) {
        if (currentCmd.queueId > 0)
            $('#queueCmd' + (currentCmd.queueId-1)).unblink();
        $('#queueCmd' + currentCmd.queueId).blink({ delay: 100 });
    }

    // Get live response
    ioSocket.on('cmdResponse', function(data) {
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
                // If we have another command in queue, continue..
                if (cmdQueue.peek() != null) {
                    mageConsole.append("-------------------------------------------------------------------<br>");
                    appendToConsole();
                } else {
                    resetWorkflowPanel();
                }
                break;
        }

        // Readjust ajax loader div
        updateAjaxLoader();
    });
}

/**
 * Reset state of workflow panel
 */
function resetWorkflowPanel() {
    if (workflowPanel != null) {
        // Reset state
        workflowPanel.close();
        workflowPanel = null;
        cmdQueue = new Queue();
    }
}

/**
 * Activate command buttons
 */
function activateCommandButtons () {
    var selectedItem = $("#activeEnvironment").val();
    if (selectedItem != 'null') {
        $("#mageReleases").prop("disabled",false);
        $("#mageDeploy").prop("disabled",false);
        $("#mageAddToFlow").prop("disabled",false);
        $("#activeRelease").prop("disabled",false);
    }else{
        $("#mageReleases").prop("disabled",true);
        $("#mageDeploy").prop("disabled",true);
        $("#mageAddToFlow").prop("disabled",true);
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
 * Load environments of selected project
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
    ioSocket.emit('tailLog', { file: orgFile, tailStatus: 'running' });

    // Get tail data from socket
    ioSocket.on('logTailContent', function(data) {
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
}

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
            toggleProjectsPageButtons('off', null); // disable buttons
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

/**
 * Switch to Selected GIT Branch
 * @param branchName
 */
function switchGitBranch(branchName) {
    var selectedProject = $('.list-group-item.active')[0];

    // jQuery AJAX call for project refresh
    $.post( '/projects/gitSwitchBranch?id=' + selectedProject.id + "&branch=" + branchName, function(result) {
        // Check if we have warning
        if(result["warn"]) {
            toastr.warning(result["message"], 'MagePanel Projects');
        } else {
            $('#'+selectedProject.id).text($('#'+selectedProject.id).text().replace(/\[.*\]/g, "[" + branchName + "]"));
            $('#refreshProjectBtn').trigger("click");
            toastr.success(result["message"], 'MagePanel Projects');
        }
    }).error(function() {
        toastr.error('Something went wrong ', 'MagePanel Projects');
    });
    $('#gitSwitchBranchProjectBtn').popover('hide');
};

/**
 * Toggle disabled/enabled states for Projects Page Buttons
 * @param mode
 * @param target
 */
function toggleProjectsPageButtons(mode, target) {
    if (mode == 'on') {
        // Enabled
        $("#editProjectBtn").prop('disabled', false);
        $("#delProjectBtn").prop('disabled', false);
        $("#refreshProjectBtn").prop('disabled', false);
        if (target.hasClass('ion-fork-repo')) {
            $("#gitPullProjectBtn").prop('disabled', false);
            $("#gitSwitchBranchProjectBtn").prop('disabled', false);
        } else {
            $("#gitPullProjectBtn").prop('disabled', true);
            $("#gitSwitchBranchProjectBtn").prop('disabled', true);
        }
    } else {
        // Disabled
        $("#editProjectBtn").prop('disabled', true);
        $("#delProjectBtn").prop('disabled', true);
        $("#refreshProjectBtn").prop('disabled', true);
        $("#gitPullProjectBtn").prop('disabled', true);
        $("#gitSwitchBranchProjectBtn").prop('disabled', true);
    }
};

/**
 * Check for Application updates
 */
function checkForUpdates() {
    // Use Socket.IO for getting live application updates
    //updateSocket = io.connect();
    ioSocket.emit('checkUpdates');

    // Update status icons
    $('#checkingUpdates').show();
    $('#updateOk').hide();
    $('#updateError').hide();

    // Get live response from socket
    ioSocket.on('updateCheck', function(data) {
        switch(data.status) {
            case "ok":
                // Update status icon
                $('#checkingUpdates').hide();
                $('#updateOk').show();
                break;
            case "updated":
                // Update status icon
                $('#checkingUpdates').hide();
                $('#updateOk').show();
                toastr.success(data.msg, 'MagePanel Auto-Updater');
                break;
            case "err":
                // Update status icon
                $('#checkingUpdates').hide();
                $('#updateError').show();
                toastr.error(data.msg, 'MagePanel Auto-Updater');
                break;
        }
    });
}

/**
 * Get Application Revision Version
 */
function getRevisionVersion() {
    // Use Socket.IO for getting live application revision version
    ioSocket.emit('revisionVersion');

    // Get live response from socket
    ioSocket.on('revisionVersion', function(data) {
        // Show revision number on tooltip
        if (! data.err) {
            $('#updateOk').attr('data-original-title', 'MagePanel ' + data.version);
        }
    });
}

/**
 * jQuery Blink Effect
 */
// Source: http://www.antiyes.com/jquery-blink-plugin
// http://www.antiyes.com/jquery-blink/jquery-blink.js
(function($)
{
    $.fn.blink = function(options)
    {
        var defaults = { delay:500 };
        var options = $.extend(defaults, options);

        return this.each(function()
        {
            var obj = $(this);
            if (obj.attr("timerid") > 0) return;
            var timerid=setInterval(function()
            {
                if($(obj).css("visibility") == "visible")
                {
                    $(obj).css('visibility','hidden');
                }
                else
                {
                    $(obj).css('visibility','visible');
                }
            }, options.delay);
            obj.attr("timerid", timerid);
        });
    }
    $.fn.unblink = function(options)
    {
        var defaults = { visible:true };
        var options = $.extend(defaults, options);

        return this.each(function()
        {
            var obj = $(this);
            if (obj.attr("timerid") > 0)
            {
                clearInterval(obj.attr("timerid"));
                obj.attr("timerid", 0);
                obj.css('visibility', options.visible?'visible':'hidden');
            }
        });
    }
}(jQuery))