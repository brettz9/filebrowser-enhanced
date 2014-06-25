# filebrowser-enhanced

[Firefox add-on](https://addons.mozilla.org/en-US/firefox/addon/filebrowser-enhanced/)
to overlay Firefox's built-in desktop browser with additional functionality.

Currently is limited to:

1. Placing the current directory as a native path within a textbox (instead
of showing the file: path as text).
1. Rather than needing to copy or change the file path within the
browser's location bar, one may also copy-paste or change the
native path within the page-internal textbox (which is capable of
path autocomplete). One may also use a native folder selector to
bring Firefox's desktop to the desired folder.
1. Adds a folder icon which can be clicked to reveal the current
directory on the native OS desktop (e.g., open the currently browsed
directory within Windows Explorer). A folder icon with the same
functionality is also present on the add-on bar when browsing to a
file: URL (e.g., when viewing a .txt file in Firefox), allowing one to
jump to the containing folder on one's desktop.
1. When a file:// URL is loaded in the tab, provide a "Copy path" item in the
add-on bar which, when clicked, copies the file's (or directory's) native
path, or when right-clicked, copies the file's (or directory's) parent
folder path.
1. When a file:// URL is right-clicked, a context menu item is displayed
which can:
    1. ...copy the native path of the directory or file to the clipboard.
    1. ...reveal the file
    1. ...execute (launch) the file (Windows only?)
1. Modifies the default styling of folder views in Firefox to remove the
large top empty space
1. Clicking on a column causes sort order to be remembered in URL
and in subsequent clicks

# Usage scenarios

1. Use with [atyourcommand](https://github.com/brettz9/atyourcommand)
to allow browsed files to be right-clicked to run on the command line
(included with saved or run-time prompted) args
1. Make bookmarks pointing to local folders or files (including within a
bookmarks folder on your toolbar (which can serve as a hotlist of
your favorite folders) and/or define
[keywords](http://kb.mozillazine.org/Using_keyword_searches)
for them, optionally allowing for arguments via `%s` in the path so that
you can type say "home myDirectory" to open a view of the local folder
within Firefox). Then use right click to execute files, copy paths, etc.
1. If you are a Windows user, you may find
[this batch file](https://github.com/brettz9/webappfind/blob/master/batch/openFolderInFirefox.bat)
added to your "SendTo" directory, convenient for allowing one to
open a directory you are browsing on the Windows desktop into
Firefox's file browser.

# Higher-priority todos
1. Per AMO review requirement, prompt user whenever they try to reveal or
execute a local file from a remote site (ideally with the option to whitelist a
particular domain) though for now just a global preference.
1. Get [jawbar](https://github.com/brettz9/jawbar) applied in place of datalist
for a richer display and decouping of user input, data, and display text.
1. Resubmit to AMO (and note to reviewers that other concerns from
last review should be overcome)
1. Allow file:// execute to be done with specific Windows
"[verbs](http://msdn.microsoft.com/en-us/library/bb165967.aspx)"
(i.e., Open, Edit, Print, Play, Preview or custom).

# Possible Todos

1. Column browser / hierarchical folder / large icon browsing
1. Make application of stylesheet customizable
1. Figure out way around "pageshow" problem of path input not getting
populate when using back button in browser.
1. Support opening file:// links from remote sites as per [LocalLink](http://locallink.mozdev.org/)
([AMO](https://addons.mozilla.org/en-US/firefox/addon/locallink/))
1. Make npm/bower/Git context menus available on right-clicked
`file://` path directories
1. Make australis/toolbar icon to support pull-down of paths which
can be invoked by keyword command but also can be directly visited
without the `%s` variable.
    1. Right-click file/folder to add to hotlist
    1. Allow location bar to use shortcuts or the like to invoke files?
1. Utilize page selection context menu (shown if current file is
file:// based) instead of add-on bar icons to allow "copy path" and "reveal"
(and plain launch, also added to add-on bar?) on current item (and
if the current document had been opened by WebAppFind, ensure
its source document path is copied, revealed, or relaunched instead
of the web app? if not opened by WebAppFind, allow launch in
WebAppFind so that, e.g., an opened text file can be launched to
be made editable).
    1. Split this functionality (along with context menus on file:// links)
    into one, two, or three different add-ons?
    1. Reference https://addons.mozilla.org/en-US/firefox/addon/local-filesystem-links/
    and support its ability to launch (as well as reveal and copy native
    path of file://?) for items found in the clipboard (albeit potentially
    with arguments (saved or prompted) in conjunction with
    [atyourcommand](https://github.com/brettz9/atyourcommand))?
    1. Prompt for WebAppFind options not only in the file browser but
    also on right-click on the file icon or equivalent)
1. Integrate or replace built-in desktop browser in a better way:
Utilize info at
http://stackoverflow.com/questions/18312461/code-responsible-for-browsing-firefoxs-desktop
or that also posted at http://forums.mozillazine.org/viewtopic.php?f=19&t=2740643 ?
1. Allow (power) sticky notes to be associated (as hidden files within
the directory) to be displayed as an overlay when browsing files (as
with a browser add-on and hopefully for a browser-in-browser); some
stickies can be file-specific meta-data or folder-specific; scrollable all
as one file or as stickies, whether local or remote (see below)
1. Links leading from file:// folders to other data sources like bookmarks,
tab groups, remote databases, etc., even if not stored as files on disk
(WebDav, Gopher, FTP, etc.? and including browsing through service
discovery for files filtered to desired types), thereby allowing sticky notes
associated with them; one doesn't HAVE to store the stickies within the
same folder (or even a real folder at all), but it makes it easier to discover
them in different ways--unless not possible (as with WebDav not under
one's control, etc.); however, should allow storing of stickies in abstract
way so get saved at same level of database, etc., if database allows this
1. Integrate with "Desktop" FF addon if his were to use iframes.
1. Integrate with Command line (e.g., as attempted in the AsYouWish
[demo](https://github.com/brettz9/asyouwish/blob/master/demos/requestPrivs-command-line-demo.html)).
1. WebAppFind
    1. Incorporate [WebAppFind](https://github.com/brettz9/webappfind)
    functionality upon right-click (including proposed dialog to prompt user
    for details like method at run time); including right-click of
    current-page add-on bar icon or page context menu
    1. Add right-click features, working with WebAppFind where possible for
    greater type-aware possibilities (e.g., when creating a file, one could
    create a bare file of the desired type)
        1. Change opening of file (rather than FF's download), alias,
        or directory to work with WebAppFind
        1. Allow creation of file, directory or alias (to file or directory)
        or zip
        1. Allow renaming (or moving) of a file, directory or alias
        1. Allow deleting of a file, directory or alias
        1. Ideally allow copy or cut-and-paste of files/directories (and
        drag-and-drop for relevant viewing modes)
        1. Support open Git GUI/bash/create repo here, edit in Notepad++,
        etc., open with, send to, properties, folder permissions
    1. Allow additional options for opening or editing file in web app (e.g.,
    saving hard-coded web apps for a given file), working with
    [WebAppFind](https://github.com/brettz9/webappfind) and
    [Executable Builder](https://github.com/brettz9/executable-builder)
    (once the latter is complete)
    1. Consider launching [AsYouWish](https://github.com/brettz9/asyouwish/)
    apps for integrated command-line or add-on-like behavior (including via
    file-path-aware right-click).
    1. When user default handlers or right-clicking to "Open with...",
    Filebrowser Enhanced could be more sophisticated than the file
    extension-using WebAppFind desktop executables in that it could
    avoid applying defaults or showing "Open with..." options if the
    particular detected file type was not relevant (e.g., don't show
    "edit mytype").
1. Add meta-data columns (at least "permissions" appears available)
1. Add OS (across all drive or all drives) file search (through js-ctypes?)
1. Ensure reading files in file browser with new Node-friendly API
so can also reuse code on server or even for HTML Ajax browsing
of file sources?)
1. Re: feature for addon bar icon revealing path of a loaded file,
have options to map websites this way also, esp. 127.0.0.1/localhost ;
have option to automatically handle click-to-expose-path if loaded
through WebAppFind (since we know where the path originated)
1. Ability to handle multiple files on right-click (unlike what seems
readily possibly in Windows through Open With... mechanism but
is possible with SendTo)
1. Any overlap with <https://github.com/FunkMonkey/Loomo>?
1. Add "Open with" transparently from Windows (though could make WebAppFind filetypes.json aware)
1. Experiment with 3d WebGL rendering
1. Smart folders ala Awesome Bar but for file:// only (per user request)
    1. Support interaction with Awesome Bar [options](https://support.mozilla.org/en-US/kb/awesome-bar-find-your-bookmarks-history-and-tabs#w_how-can-i-control-what-results-the-location-bar-shows-me)
    (or equivalent) and [flags](https://support.mozilla.org/en-US/kb/awesome-bar-find-your-bookmarks-history-and-tabs#w_changing-results-on-the-fly)
1. Add filtering of current files/folders (per user request)
1. Support tab/shift-tab key for autocomplete as in Windows explorer (per user request)
1. Ensure launched files (including via AtYourCommand) somehow can get added
to history instead of only those pages viewable and viewed in the browser.
1. Utilize
[js-ctypes](https://developer.mozilla.org/en-US/docs/Mozilla/js-ctypes)
to provide option to populate path selection with OS-specific file results
as well as or in place of our own location bar algorithm
