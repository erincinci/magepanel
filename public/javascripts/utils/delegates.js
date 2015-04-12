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
 * Env Editor UI - Remove host panel button delegate
 */
$(document).delegate('#envEditRemoveHostBtn', 'click', function(e) {
    $(this).closest('div .list-group-item').remove();
});