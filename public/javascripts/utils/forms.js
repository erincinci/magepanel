/**
 * Created by erinci on 27.01.2015.
 */
// System Setup Page - Form onSubmit Events =============================================================
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

// Projects Page - Form onSubmit Events =============================================================
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
 * Submit edited project environment via UI
 */
$('#envEditorUIForm').submit(function(event) {
    event.preventDefault();
    // Get current form data
    var formData = {
        orgFile: $("#orgFile").val(),
        code: codeMirror.getValue()
    };
    var selectedItem = $('.list-group-item.active')[0];

    $.post( '/projects/applyFile', formData, function(result) {
        // Check if we have warning
        if(result["warn"]) {
            toastr.warning(result["message"], 'MagePanel Projects');
        } else {
            $('#envEditorModal').modal('hide');
            $('#'+selectedItem.id).trigger("click");
            toastr.success(result["message"], 'MagePanel Projects');
        }
    }).error(function() {
        toastr.error('Something went wrong ', 'MagePanel Projects');
    });
});

// Tags Page - Form onSubmit Events =============================================================
/**
 * Submit add new tag form
 */
$('#addTagForm').submit(function(event) {
    event.preventDefault();
    var formData = $(this).serialize();

    addTagToDB(formData);
});

/**
 * Submit edit tag form
 */
$('#editTagForm').submit(function(event) {
    event.preventDefault();
    var formData = $(this).serialize();
    var tagId = $('.list-group-item.active')[0].id;

    // First delete old tag
    $.post( '/tags/delete?id=' + tagId, function(result) {
        // Check if we have warning
        if(result["warn"]) {
            toastr.warning(result["message"], 'MagePanel Tags');
        } else {
            // No error deleting, then add edited tag as new
            addTagToDB(formData);
        }
    }).error(function() {
        toastr.error('Something went wrong ', 'MagePanel Tags');
    });
});