/**
 * Created by erinci on 27.01.2015.
 */
// Modal Functions =======================================================
/**
 * On Models Hidden Event
 */
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

/**
 * Edit File Modal Shown Event
 */
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

/**
 * Edit Project Modal Shown Event
 */
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

/**
 * View File Modal Shown Event
 */
$('#viewFileModal').on('shown.bs.modal', function () {
    // Adjust ViewFile Modal Size
    $('#viewFileModal .modal-body').css({'height': $(window).height() * 0.7});
    $('#logView').css({'height': $(window).height() * 0.68});
});

/**
 * View File Modal Hidden Event
 */
$('#viewFileModal').on('hidden.bs.modal', function () {
    // End file tail command on modal hidden
    ioSocket.emit('exitTail', {});
});

/**
 * Add Project Env Modal Shown Event
 */
$('#addProjectEnvModal').on('shown.bs.modal', function () {
    $('#projectIdEnv').val($('.list-group-item.active')[0].id);
});

/**
 * Add Project Task Modal Shown Event
 */
$('#addProjectTaskModal').on('shown.bs.modal', function () {
    $('#projectIdTask').val($('.list-group-item.active')[0].id);
});
