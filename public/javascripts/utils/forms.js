/**
 * Created by erinci on 27.01.2015.
 */
// Form onSubmit Events =============================================================
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
 * Submit GIT switch branch form
 */
$('#switchGitBranchForm').submit(function(event) {
    // TODO: Switch GIT branch of project on submit
    event.preventDefault();
    var formData = $(this).serialize();
    console.debug(formData);
    var selectedItem = $('.list-group-item.active')[0];

    // Cancel if selection is not valid
    if (selectedItem == null) {
        toastr.warning("Select a project first", 'MagePanel Projects');
        return;
    }

    // jQuery AJAX call for project refresh
    toastr.info('/projects/gitSwitchBranch?id=' + selectedItem.id + "&branch=" + $('#switchBranchPicker').val(), 'DEBUG');
    /*$.post( '/projects/gitSwitchBranch?id=' + selectedItem.id + "&branch=" + $('#switchBranchPicker').val(), function(result) {
     // Check if we have warning
     if(result["warn"]) {
     toastr.warning(result["message"], 'MagePanel Projects');
     } else {
     $('#'+selectedItem.id).trigger("click");
     $('#refreshProjectBtn').click();
     toastr.success(result["message"], 'MagePanel Projects');
     }
     }).error(function() {
     toastr.error('Something went wrong ', 'MagePanel Projects');
     });*/
});