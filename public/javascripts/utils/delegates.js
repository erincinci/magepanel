/**
 * Created by erinci on 27.01.2015.
 */
// Element Delegates =============================================================
/**
 * Projects Page - Project list group item on select action
 */
$(document).delegate('#projectsList .list-group-item', 'click', function(e) {
    var previous = $(this).closest(".list-group").children(".active");
    previous.removeClass('active'); // previous list-item

    var selected = $(this)[0];
    var isGit = $(this).children("h5").hasClass("ion-fork-repo");
    $(this).addClass('active'); // activated list-item

    toggleProjectsPageButtons('on', isGit); // enable buttons
    // jQuery AJAX call for project detail
    $.get( '/projects/detail?id=' + selected.id, function(output) {
        $('#projectDetail').html(output);
    });
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