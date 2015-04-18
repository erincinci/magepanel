/**
 * Created by erincinci on 16/04/15.
 */
/**
 * Reset Env Editor UI to its original state
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
     * Adjust General Env Editor Text Inline Edits
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
     * Adjust Host IP Inline Edits
     */
    $(".inlineEdit.envEditorInlineHosts").each(function (index, el) {
        inlineEditables[$(el).attr('id')] = $(this).editable({
            success: function(response, newValue) {
                // On success replace appropriate string in raw editor
                var oldValue = $(this).editable('getValue', true);
                replaceInCodemirrorCode(oldValue, newValue);

                // Refresh drag & drop panels
                initDragDrops();
            }
        });
    });

    /*
     * Adjust Task Variable Inline Edits
     */
    $(".inlineEdit.taskVarEdit").each(function (index, el) {
        $(this).editable({
            mode: 'popup',
            success: function(response, newValue) {
                // On success replace appropriate string in raw editor
                var oldValue = $(this).editable('getValue', true);
                var taskName = $(el).data('taskname');
                var varName = $(el).attr('name');
                console.debug(taskName, varName, oldValue, newValue);
                // TODO: Replace in raw editor
                //replaceInCodemirrorCode(oldValue, newValue);

                // Refresh drag & drop panels
                initDragDrops();
            }
        });
    });

    /*
     * Init Special Inline Editables with Element IDs
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
    // Parse YAML file contents to JSON
    try {
        var env = jsyaml.load(envFileData);
    } catch(err) {
        // Error handling
        toastr.error("Error parsing YAML file: " + err, "MagePanel Projects");
        $('#envEditorModal').modal('hide');
        hideAjaxLoader();
        return;
    }

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
        $.each(env.hosts, function(leftVal, rightVal) {
            /*
             * Two host definition types:
             * 1 - Index: IP (String)   |   Value: null OR Object of tasks array
             * 2 - Index: 0, 1, ..      |   Value: IP (String)
             */
            var ip, hostTasks;
            if (typeof rightVal === "string") {
                // Type-2
                ip = rightVal;

                // Host panels without specific tasks
                prepareEnvEditorHostPanelGroup('ddHosts', ip, false);
            } else {
                // Type-1
                ip = leftVal;
                hostTasks = rightVal;

                // Host panels with specific tasks
                var hostDivId = prepareEnvEditorHostPanelGroup('ddHosts', ip, (hostTasks != null));

                // Clean host tasks (Root value differs from type-1 to type-2)
                if (hostTasks != null) {
                    if (Object.keys(hostTasks)[0] == "tasks")
                        hostTasks = hostTasks["tasks"];
                }

                // Prepare host specific task panels
                appendTaskListEnvEditor(hostTasks, hostDivId);
            }
        });

        // TODO: Handle add & remove of hosts!
    }

    // Section - Tasks
    if (env.tasks) {
        // Do for each stage
        appendTaskListEnvEditor(env.tasks, '');

        // Uncollapse if no globals tasks
        if (isArrayContentsEmpty(env.tasks))
            $('#envEditTasksPanel').collapse('hide');
    }

    // Refresh dynamic DOMs
    setupEnvEditor();
    initDragDrops();
}

/**
 * Env Editor - Append Tasks to UI
 * @param tasksJson
 * @param customDivId
 */
function appendTaskListEnvEditor(tasksJson, customDivId) {
    // Check JSON
    if (tasksJson) {
        $.each(tasksJson, function(stage, tasks) {
            // If there are any tasks defined in the current stage
            if (tasks) {
                $.each(tasks, function(i, stageTask) {
                    // Check if task has variables
                    if (stageTask instanceof Object) {
                        // Task with variables
                        $.each(stageTask, function(taskName, taskVars) {
                            // Append task with variables
                            appendEnvTaskToList(customDivId, stage, taskName, taskVars);
                        });
                    } else {
                        // Append task with no variables
                        appendEnvTaskToList(customDivId, stage, stageTask, []);
                    }
                });
            }
        });
    }
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
    var availableTasksDD = $("ol.dragdrop#ddAvailableTasks").sortable({
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
        placeholder: '<li class="list-group-item-success" />',
        onDrop: function (item, container, _super) {
            // TODO: On tasks change update raw editor
            var data = this.sortable("serialize").get();
            var jsonString = JSON.stringify(data, null, ' ');
            console.debug(jsonString);
            _super(item, container)
        }
    });

    $("ol.dragdrop#ddTrash").sortable({
        group: "tasks",
        drop: true,
        drag: false,
        onDrop: function (item, container, _super) {
            // Remove the element dropped on trash
            console.log("will remove:", item);
            item.remove();
            _super(item);
        }
    }).disableSelection();

    // Deprecated
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
 * @param isCollapsed
 * @returns {number}
 */
function prepareEnvEditorHostPanelGroup(listId, ip, isCollapsed) {
    // Random div id
    if (! ip)
        ip = '##.##.##.##';
    var divId = Math.floor((Math.random() * 999999) + 1);
    var collapsedDiv = '';
    if (isCollapsed)
        collapsedDiv = ' in';

    var hostPanel =
        '<div class="list-group-item small">' +
        '<div class="glyphicon glyphicon-hdd" style="width: 100%">' + '  ' +
        '<a href="#" class="inlineEdit envEditorInlineHosts">' + ip + '</a>' +
        '<div class="btn-group btn-group-xs pull-right" role="group">' +
        '<a href="#" class="toggleEnvTasksBtn btn btn-xs fa fa-angle-down" data-toggle="collapse" data-target="#' + divId + '" style="text-decoration: none; vertical-align: top; margin-top: 0px;") />' +
        '<a id="envEditRemoveHostBtn" href="#" class="btn btn-xs fa fa-minus" style="text-decoration: none; vertical-align: top; margin-top: 0px;") />' +
        '</div>' +
        '</div>' +
        '<div class="collapse withIcon' + collapsedDiv + '" id="' + divId + '">' +
        appendNewEnvHostPanel('ddPreDeploy-'+divId, 'Pre-Deploy') +
        appendNewEnvHostPanel('ddOnDeploy-'+divId, 'On-Deploy') +
        appendNewEnvHostPanel('ddPostRelease-'+divId, 'Post-Release') +
        appendNewEnvHostPanel('ddPostDeploy-'+divId, 'Post-Deploy') +
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
 * @param divId
 * @param title
 * @returns {string}
 */
function appendNewEnvHostPanel(divId, title) {
    var panel =
        '<div class="panel panel-info" style="margin-bottom: 5px;">' +
        '<div class="panel-heading">' + title + '</div>' +
        '<div class="panel-body" style="margin-left: 10px;">' +
        '<ol class="list-group dragdrop taskGroup envTasks" style="margin-bottom: 5px;" id="' + divId + '" />' +
        '</div>' +
        '</div>';
    return panel;
}

/**
 * Append new task list-item to the specified list
 * with name and custom variables, if there are any
 * @param divId
 * @param stage (pre-deploy | on-deploy | post-release | post-deploy)
 * @param taskName
 * @param taskVars
 */
function appendEnvTaskToList(divId, stage, taskName, taskVars) {
    // Prepare task variables
    var taskVarsStr = '';
    if (taskVars) {
        $.each(taskVars, function(name, value) {
            taskVarsStr += '[' + name + ': ' +
                            '<a class="inlineEdit taskVarEdit" href="#" name="' + name + ': " data-taskname="' + taskName + '">' +
                                value +
                            '</a>' +
                        '] ';
        });
    }

    // Prepare panel ID
    var panelId = '';
    switch (stage) {
        case 'pre-deploy':
            panelId = 'ddPreDeploy';
            break;
        case 'on-deploy':
            panelId = 'ddOnDeploy';
            break;
        case 'post-release':
            panelId = 'ddPostRelease';
            break;
        case 'post-deploy':
            panelId = 'ddPostDeploy';
            break;
    }
    if (divId != '')
        panelId += '-' + divId;

    // Prepare task
    var task =
        '<li class="list-group-item draggable small ion-drag" id="' + panelId + '-' + taskName + '" data-tasks="' + JSON.stringify(taskVars) + '">' +
        '  <b>' + taskName + '</b>' +
        '  <i class="taskVars" style="font-style: italic;">' + taskVarsStr + '</i>'
    '</li>';

    // Append created task to the list
    $('#'+panelId).append(
        task
    );
}