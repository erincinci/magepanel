/**
 * Created by erinci on 27.01.2015.
 */
// Element Delegates =============================================================
/**
 * Projects Page - Project list group item on select action
 */
$(document).delegate('#projectsList .list-group-item', 'click', function(e) {
    // Find other projectLists and deactivate them
    $('.list-group-item.active').not( document.getElementById($( this ).attr('id') )).each(function (index, otherActive) {
        $(otherActive).removeClass('active');
    });

    // Clear previous active item in the current project list
    var previous = $(this).closest(".list-group").children(".active");
    previous.removeClass('active');

    // Find the new selected one and activate it
    var selected = $(this)[0];
    var isGit = $(this).children("h5").hasClass("ion-fork-repo");
    $(this).addClass('active');

    // Enable specific buttons for the selected item
    toggleProjectsPageButtons('on', isGit);

    // jQuery AJAX call for project detail
    $.get( '/projects/detail?id=' + selected.id, function(output) {
        $('#projectDetail').html(output);
    });
});

// Only keep one collapsable panel open at a time
$(document).delegate('.panel-collapse', 'show.bs.collapse', function() {
    $('.panel-collapse').not( document.getElementById($( this ).attr('id') ))
        .removeClass('in')
        .addClass('collapse');
});

/**
 * Tags Page - Tags list group item on select action
 */
$(document).delegate('#tagsList .list-group-item', 'click', function(e) {
    var previous = $(this).closest(".list-group").children(".active");
    previous.removeClass('active'); // previous list-item

    var selected = $(this)[0];
    $(this).addClass('active'); // activated list-item

    toggleTagsPageButtons('on'); // enable buttons
});

/**
 * MageLogs Page - Project list group item on select action
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

/**
 * Env Editor UI
 */
// Remove host panel button delegate
$(document).delegate('#envEditRemoveHostBtn', 'click', function(e) {
    $(this).closest('div .list-group-item').remove();
});

// Collapse button icon change
$(document).delegate('.withIcon', 'shown.bs.collapse', function(e) {
    var toggleButton = $(this).parent().find('.toggleEnvTasksBtn')[0];
    if (toggleButton)
        $(toggleButton).removeClass('fa-angle-down').addClass('fa-angle-up');
});
$(document).delegate('.withIcon', 'hidden.bs.collapse', function(e) {
    var toggleButton = $(this).parent().find('.toggleEnvTasksBtn')[0];
    if (toggleButton)
        $(toggleButton).removeClass('fa-angle-up').addClass('fa-angle-down');
});

// On Raw File Editor Tab Shown Event
$(document).delegate('#showRawEditorTab', 'shown.bs.tab', function(e) {
    // Refresh or Initialize CodeMirror Editor
    // TODO: CodeMirror not showing!
    if (codeMirror instanceof CodeMirror) {
        console.debug("Refreshing editor..");
        codeMirror.refresh();
    } else {
        // Convert textarea to CodeMirror editor
        console.debug("Initializing editor..");
        codeMirror = CodeMirror.fromTextArea(document.getElementById("code"), {
            lineNumbers: true,
            lineWrapping: true,
            styleActiveLine: true,
            tabMode: 'spaces',
            theme: 'mdn-like',
            mode: 'yaml'
        });
        codeMirror.setSize('100%', 50);
        codeMirror.refresh();
    }
})