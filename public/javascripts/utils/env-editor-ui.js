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
                // Host with specific tasks
                var divId = prepareEnvEditorHostPanelGroup('ddHosts', Object.keys(hostTasks)[0]);

                // TODO: Prepare host specific task panels
                //appendTaskListEnvEditor(env.tasks, divId);
            } else {
                // Host without specific tasks
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
        appendTaskListEnvEditor(env.tasks, '');
    }
}

/**
 * Env Editor - Append Tasks to UI
 * @param tasksJson
 * @param customDivId
 */
function appendTaskListEnvEditor(tasksJson, customDivId) {
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
                        //console.debug(taskName, ':', taskVars);
                        // TODO: Send to task list item creator!
                        appendEnvTaskToList(customDivId, stage, taskName, taskVars);
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
    console.dir(taskVars);
    $.each(taskVars, function(name, value) {
        taskVarsStr += '[' + name + ': ' + value + '] ';
    });

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
        '  ' + taskName +
        '  <i class="taskVars" style="font-style: italic;">' + taskVarsStr + '</i>'
    '</li>';

    // Append created task to the list
    $('#'+panelId).append(
        task
    );
}