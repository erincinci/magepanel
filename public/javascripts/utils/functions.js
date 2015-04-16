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
    updateAjaxLoader();
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

    // Use Socket.IO for getting live command response
    var currentCmd = cmdQueue.dequeue();
    $('#console').append("<span class='console-pointer'>&gt;&gt; </span><b>" + currentCmd.desc + "</b><br>");
    ioSocket.emit('mageCommand', { cmd: currentCmd.cmd, id: currentCmd.projectId });
    showAjaxLoader();

    // If it is a workflow, mark the active command that is being executed
    if (currentCmd.multi) {
        if (currentCmd.queueId > 0)
            $('#queueCmd' + (currentCmd.queueId-1)).unblink();
        $('#queueCmd' + currentCmd.queueId).blink({ delay: 100 });
    }
}

/**
 * Get Live Socket.IO Messages
 */
function getSocketIOMessages() {
    // Get live response for Mage Console
    if ($('#console').length) {
        console.debug("Mage Console Socket.IO activated..");
        var mageConsole = $('#console');
        var mageConsoleFrame = $('#consoleFrame');
        ioSocket.on('cmdResponse', function(data) {
            switch(data.status) {
                case "stdout":
                    // Append results to console tag
                    mageConsole.append(data.result);
                    mageConsoleFrame.scrollTop(mageConsoleFrame[0].scrollHeight);
                    break;
                case "stderr":
                    // Show error in MageConsole in different style
                    mageConsole.append(data.result);
                    mageConsoleFrame.scrollTop(mageConsoleFrame[0].scrollHeight);
                    hideAjaxLoader();
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

    // Get live response for Log tails
    if ($('#logView').length) {
        console.debug("Log Tail Socket.IO activated..");
        var logView = $('#logView');
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

    // Get live response for application updates
    console.debug("Auto-Update Socket.IO activated..");
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

    // Get live response for revision version of application
    console.debug("App Revision Version Socket.IO activated..");
    ioSocket.on('revisionVersion', function(data) {
        // Show revision number on tooltip
        if (! data.err) {
            $('#updateOk').attr('data-original-title', 'MagePanel ' + data.version);
        }
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
 * Reset Evn Editor UI to its original state
 */
function resetEnvEditorPanels() {
    $('#ddHosts').empty();
    $('#ddPreDeploy').empty();
    $('#ddOnDeploy').empty();
    $('#ddPostRelease').empty();
    $('#ddPostDeploy').empty();
}

/**
 * Setup Env Editor UI
 */
function setupEnvEditor() {
    /*
     * Adjust text inline edits
     */
    $(".inlineEdit.envEditorInline").each(function (index, el) {
        inlineEditables[$(el).attr('id')] = $(this).editable({
            success: function(response, newValue) {
                // On success replace appropriate string in raw editor
                var name = $(el).attr('name');
                var oldValue = name + $(this).editable('getValue', true);
                newValue = name + newValue;
                replaceInCodemirrorCode(oldValue, newValue);

                // Refresh drag & drop panels
                initDragDrops();
            }
        });
    });

    /*
     * Adjust Host ip inline edits
     */
    $(".inlineEdit.envEditorInlineHosts").each(function (index, el) {
        inlineEditables[$(el).attr('id')] = $(this).editable({
            success: function(response, newValue) {
                // On success replace appropriate string in raw editor
                var oldValue = '- ' + $(this).editable('getValue', true);
                newValue = '- ' + newValue;
                replaceInCodemirrorCode(oldValue, newValue);

                // Refresh drag & drop panels
                initDragDrops();
            }
        });
    });

    /*
     * Init Special Inline Editables
     */
    $('#deployStrategy').editable({
        value: 'rsync',
        source: [
            {value: 'rsync', text: 'Rsync'},
            {value: 'targz', text: 'tar.gz'},
            {value: 'git-rebase', text: 'GIT Rebase'},
            {value: 'disabled', text: 'Disabled'}
        ],
        success: function(response, newValue) {
            // On success replace appropriate string in raw editor
            var name = $(this).attr('name');
            var oldValue = name + $(this).editable('getValue', true);
            newValue = name + newValue;
            replaceInCodemirrorCode(oldValue, newValue);

            // Refresh drag & drop panels
            initDragDrops();
        }
    });

    initDragDrops();
}

/**
 * Find & Replace Code Fragment in CodeMirror Editor
 * @param oldValue
 * @param newValue
 */
function replaceInCodemirrorCode(oldValue, newValue) {
    // Check if we are updating codemirror instance or textarea component
    if (codeMirror instanceof CodeMirror) {
        var newCode = codeMirror.getValue().replace(new RegExp(oldValue, ''), newValue);
        codeMirror.setValue(newCode);
        codeMirror.refresh();
    } else {
        var rawEditor = $('#envRawEditor');
        rawEditor.val(rawEditor.val().replace(new RegExp(oldValue,''), newValue));
    }
}

/**
 * Update Environment Editor UI Elements
 * @param envFileData
 */
function updateEnvEditorUI(envFileData) {
    /*
     * Set UI Editor Values to env file values
     */
    var env = jsyaml.load(envFileData);

    // TODO: Get available tasks from projects DB & add them to the left panel!

    // Section - Deployment
    $('#deployUser').editable('setValue', env.deployment.user);
    $('#deployFromDir').editable('setValue', env.deployment.from);
    $('#deployToDir').editable('setValue', env.deployment.to);
    $('#deployStrategy').editable('setValue', env.deployment.strategy);
    if (env.deployment.excludes) {
        env.deployment.excludes.forEach(function(exclude, index) {
            $('#deployExcludes').tagsinput('add', exclude);
        });
    }

    // Section - Releases
    $('#releasesEnabled').prop('checked', env.releases.enabled);
    $('#releasesMax').editable('setValue', env.releases.max);
    $('#releasesSymLink').editable('setValue', env.releases.symlink);
    $('#releasesDir').editable('setValue', env.releases.directory);

    // Section - Hosts
    if (env.hosts) {
        $.each(env.hosts, function(ip, hostTasks) {
            // Check if host has custom tasks
            if (hostTasks instanceof Object) {
                var arr = jQuery.makeArray(hostTasks);
                // TODO: Fix
                prepareEnvEditorHostPanelGroup('ddHosts', ip);
            } else {
                prepareEnvEditorHostPanelGroup('ddHosts', hostTasks);
            }

            // TODO: Add host's tasks to the appropriate panels
        });

        // TODO: Handle add & remove of hosts!

        // Attach jQuery Sortable scripts to new elements
        setupEnvEditor();
    }

    // TODO: Section - Tasks
    if (env.tasks) {
        // Do for each stage
        appendTaskListEnvEditor(env.tasks, 'ddPreDeploy', 'ddOnDeploy', 'ddPostRelease', 'ddPostDeploy');
    }
}

/**
 * Env Editor - Append Tasks to UI
 * @param tasksJson
 * @param preDeployId
 * @param onDeployId
 * @param postReleaseId
 * @param postDeployId
 */
function appendTaskListEnvEditor(tasksJson, preDeployId, onDeployId, postReleaseId, postDeployId) {
    // Check JSON
    $.each(tasksJson, function(stage, tasks) {
        // If there are any tasks defined in the current stage
        if (tasks) {
            console.debug("Stage: ", stage);
            $.each(tasks, function(i, stageTask) {
                // Check if task has variables
                if (stageTask instanceof Object) {
                    // Task with variables
                    $.each(stageTask, function(taskName, taskVars) {
                        console.debug(taskName, ':', taskVars);
                        // TODO: Send to task list item creator!
                        //appendEnvTaskToList(listId, taskName, taskVars)
                    });
                } else {
                    // Task with no variables
                    console.debug(stageTask);
                }
            });
        }
    });
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
        success : function (envFileData) {
            // Set hidden input value & Change modal title
            $("#orgFile").val(orgFile);
            $("#envEditorModalLabel").html(" Environment Editor - '<strong>" + envName.capitalize() + "</strong>'");

            // Update env editor UI
            updateEnvEditorUI(envFileData);

            /*
             * Set Code content to Raw Editor & Init CodeMirror
             */
            $("textarea#envRawEditor").val(envFileData);
            if (! (codeMirror instanceof CodeMirror)) {
                // Convert textarea to CodeMirror editor
                codeMirror = CodeMirror.fromTextArea(document.getElementById("envRawEditor"), {
                    lineNumbers: true,
                    lineWrapping: true,
                    styleActiveLine: true,
                    tabMode: 'spaces',
                    theme: 'mdn-like',
                    mode: 'yaml'
                });
            } else {
                codeMirror.refresh();
            }

            // Show modal window
            $('#envEditorModal').modal('show');
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
            $('#projectListContainer').load(document.URL +  ' #projectsPanel');
            $('#projectDetail').html("Select a project..");
            toggleProjectsPageButtons('off', null); // disable buttons
            toastr.success(result["message"], 'MagePanel Projects');
        }
    }).error(function() {
        toastr.error('Something went wrong ', 'MagePanel Projects');
    });
}

/**
 * Add new tag to DB using form data
 * @param formData
 */
function addTagToDB(formData) {
    $.post( '/tags/add', formData, function(result) {
        // Check if we have warning
        if(result["warn"]) {
            toastr.warning(result["message"], 'MagePanel Tags');
        } else {
            $('.modal').modal('hide');
            $('#tagsListContainer').load(document.URL +  ' #tagsList');
            toggleTagsPageButtons('off'); //disable buttons
            toastr.success(result["message"], 'MagePanel Tags');
        }
    }).error(function() {
        toastr.error('Something went wrong ', 'MagePanel Tags');
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
            $('#refreshProjectBtn').click();
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
function toggleProjectsPageButtons(mode, isGit) {
    if (mode == 'on') {
        // Enabled
        $("#editProjectBtn").prop('disabled', false);
        $("#delProjectBtn").prop('disabled', false);
        $("#refreshProjectBtn").prop('disabled', false);
        if (isGit) {
            $("#gitPullProjectBtn").prop('disabled', false);
            $("#gitCommitPushProjectBtn").prop('disabled', false);
            $("#gitSwitchBranchProjectBtn").prop('disabled', false);
        } else {
            $("#gitPullProjectBtn").prop('disabled', true);
            $("#gitCommitPushProjectBtn").prop('disabled', true);
            $("#gitSwitchBranchProjectBtn").prop('disabled', true);
        }
    } else {
        // Disabled
        $("#editProjectBtn").prop('disabled', true);
        $("#delProjectBtn").prop('disabled', true);
        $("#refreshProjectBtn").prop('disabled', true);
        $("#gitPullProjectBtn").prop('disabled', true);
        $("#gitCommitPushProjectBtn").prop('disabled', true);
        $("#gitSwitchBranchProjectBtn").prop('disabled', true);
    }
};

/**
 * Toggle disabled/enabled states for Tags Page Buttons
 * @param mode
 */
function toggleTagsPageButtons(mode) {
    if (mode == 'on') {
        // Enabled
        $("#editTagBtn").prop('disabled', false);
        $("#delTagBtn").prop('disabled', false);
    } else {
        // Disabled
        $("#editTagBtn").prop('disabled', true);
        $("#delTagBtn").prop('disabled', true);
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
}

/**
 * Get Application Revision Version
 */
function getRevisionVersion() {
    // Use Socket.IO for getting live application revision version
    ioSocket.emit('revisionVersion');
}

/**
 * Update stats page components
 * @param selectedFrom
 * @param selectedTo
 */
function updateStatsComponents(selectedFrom, selectedTo) {
    // Prepare date range
    var fromTimestamp = selectedFrom ? selectedFrom : (new Date(0) / 1000).toFixed(0);
    var toTimestamp = selectedTo ? selectedTo : (new Date() / 1000).toFixed(0);
    //console.debug(fromTimestamp + " --> " + toTimestamp);

    // Get stats from backend using socket.io
    showAjaxLoader();
    ioSocket.emit('getStats', { from: fromTimestamp, to: toTimestamp });
    ioSocket.on('statsCalculated', function(stats) {
        // Error handling
        if (stats.err) {
            toastr.warning(stats.err, 'MagePanel Stats');
            hideAjaxLoader();
            return;
        }

        // Update odometers
        odometers['projectsOdometer'].update(stats.data.numProjects);
        odometers['tagsOdometer'].update(stats.data.numTags);
        odometers['envOdometer'].update(stats.data.numEnvs);
        odometers['tasksOdometer'].update(stats.data.numTasks);
        odometers['mailsOdometer'].update(stats.data.mailsSent);
        odometers['workflowsOdometer'].update(stats.data.workflowsRun);

        // Update charts
        $('.chart-curtain').show();
        generateDeployPie("deploysPie", stats.data);
        generateAvgDeployTimeGraph("avgDeployTimeGraph", stats.data);

        hideAjaxLoader();
    });
}

/**
 * Clear Drag & Drop Trash List Items
 * @param trashId
 */
function clearDragDropTrash(trashId) {
    $('#' + trashId).empty();
}

/**
 * Init Drag & Drop Sortables
 */
function initDragDrops() {
    $("ol.dragdrop#ddAvailableTasks").sortable({
        group: "tasks",
        drop: false,
        drag: true,
        onDragStart: function (item, container, _super) {
            // Duplicate items of the no drop area
            if(!container.options.drop)
                item.clone().insertAfter(item);
            _super(item);
        }
    }).disableSelection();

    $("ol.dragdrop.envTasks").sortable({
        group: "tasks",
        drop: true,
        drag: true,
        pullPlaceholder: true,
        placeholder: '<li class="list-group-item-success" />'
    }).disableSelection();

    $("ol.dragdrop#ddTrash").sortable({
        group: "tasks",
        drop: true,
        drag: false,
        onDrop: function (item, container, _super, event) {
            // Remove the element dropped on trash
            console.log("will remove:", item);
            item.remove();
            _super(item);
        }
    }).disableSelection();

    $("ol.dragdrop#ddHosts").sortable({
        group: "hosts",
        drop: true,
        drag: true
    }).disableSelection();
}

/**
 * Prepare env editor new host panel
 * @param listId
 * @param ip
 * @returns {number}
 */
function prepareEnvEditorHostPanelGroup(listId, ip) {
    // Random div id
    if (! ip)
        ip = '##.##.##.##';
    var divId = Math.floor((Math.random() * 999999) + 1);

    var hostPanel =
        '<div class="list-group-item small">' +
            '<div class="glyphicon glyphicon-hdd" style="width: 100%">' + '  ' +
            '<a href="#" class="inlineEdit envEditorInlineHosts">' + ip + '</a>' +
            '<div class="btn-group btn-group-xs pull-right" role="group">' +
            '<a href="#" class="toggleEnvTasksBtn btn btn-xs fa fa-angle-down" data-toggle="collapse" data-target="#' + divId + '" style="text-decoration: none; vertical-align: top; margin-top: 0px;") />' +
            '<a id="envEditRemoveHostBtn" href="#" class="btn btn-xs fa fa-minus" style="text-decoration: none; vertical-align: top; margin-top: 0px;") />' +
            '</div>' +
            '</div>' +
            '<div class="collapse withIcon" id="' + divId + '">' +
            appendNewEnvHostPanel('Pre-Deploy') +
            appendNewEnvHostPanel('On-Deploy') +
            appendNewEnvHostPanel('Post-Release') +
            appendNewEnvHostPanel('Post-Deploy') +
            '</div>' +
            '</div>';

    // Append to list
    $('#'+listId).append(
        hostPanel
    );
    return divId;
}

/**
 * Prepare a new host panel group for env editor UI
 * @param title
 * @returns {*|jQuery|HTMLElement}
 */
function appendNewEnvHostPanel(title) {
    var panel =
        '<div class="panel panel-info" style="margin-bottom: 5px;">' +
            '<div class="panel-heading">' + title + '</div>' +
            '<div class="panel-body" style="margin-left: 10px;">' +
                '<ol class="list-group dragdrop taskGroup envTasks" style="margin-bottom: 5px;" />' +
            '</div>' +
        '</div>';
    return panel;
}

/**
 * Append new task list-item to the specified list
 * with name and custom variables, if there are any
 * @param listId
 * @param taskName
 * @param taskVars
 */
function appendEnvTaskToList(listId, taskName, taskVars) {
    // Prepare task variables
    var taskVarsStr = '';
    if (taskVars.length > 0) {
        $.each(taskVars, function(name, value) {
            taskVarsStr += '[' + name + ': ' + value + '] ';
        });
    }

    // Prepare task
    var task =
        '<li class="list-group-item draggable small ion-drag" id="' + listId + '-' + taskName + '" data-tasks="' + JSON.stringify(taskVars) + '">' +
            '  ' + taskName +
            '<i class="taskVars" style="font-style: italic;">' + taskVarsStr + '</i>'
        '</li>';

    // Append created task to the list
    $('#'+listId).append(
        task
    );
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