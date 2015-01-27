/**
 * Created by erinci on 27.01.2015.
 */
// Mage Console Page - Button onClick Events =============================================================
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

// Projects Page - Button onClick Events =============================================================
/**
 * Project Page Button Click Events
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
                $("#gitPullProjectBtn").prop('disabled',true);
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

/**
 * GIT Pull project button onClick
 */
$('#gitPullProjectBtn').on('click', function() {
    var selectedItem = $('.list-group-item.active')[0];

    // Cancel if selection is not valid
    if (selectedItem == null) {
        toastr.warning("Select a project first", 'MagePanel Projects');
        return;
    }

    // jQuery AJAX call for project refresh
    $.post( '/projects/gitPull?id=' + selectedItem.id, function(result) {
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

/**
 * GIT Switch Branch button onClick
 */
$('#gitSwitchBranchProjectBtn').on('click', function() {
    // TODO: Adjust popover content style

    var selectedItem = $('.list-group-item.active')[0];
    el = $(this);

    $.post( '/projects/gitRemoteBranches?id=' + selectedItem.id, function(result) {
        var content_header = '<form class="form-inline" id="switchGitBranchForm" role="form" style="width:400px"><div class="form-group">' +
            '<select id="switchBranchPicker" name="newBranchName" data-width="160px" data-size="8" class="selectpicker">';
        var content_footer = '</select> <button class="btn btn-primary" id="switchToSelectedBranchBtn" type="button" onclick="switchGitBranch(switchBranchPicker.value);">Switch &raquo;</button>' +
            '</div></form>';
        var options = '';
        var branches = result["message"];
        $.each(branches, function(i, val) {
            options += '<option data-icon="ion-fork-repo">' + val + '</option>';
        });
        var content = content_header + options + content_footer;

        //el.unbind('click').popover({
        el.popover({
            content: content,
            title: 'Switch Branch',
            html: true,
            delay: {show: 400, hide: 100}
        }).popover('show');
    });
});
$('#gitSwitchBranchProjectBtn').on('shown.bs.popover', function () {
    // Set style for selectpicker on popover content shown event
    $('.selectpicker').selectpicker('refresh');
});

// Mage Logs Page - Button onClick Events =============================================================

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
