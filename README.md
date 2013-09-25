filebrowser-enhanced
====================

Overlays Firefox's built-in desktop browser with additional functionality.

Currently is limited to:

1. Placing the current directory as a native path within a textbox (instead of showing the file: path as text).
1. Rather than needing to copy or change the file path within the browser's location bar, one may also copy-paste or change the native path within the page-internal textbox (which is capable of path autocomplete).
1. Adds a folder icon which can be clicked to reveal the current directory on the native OS desktop (e.g., open the currently browsed directory within Windows Explorer). A folder icon with the same functionality is also present on the add-on bar when browsing to a file: URL (e.g., when viewing a .txt file in Firefox), allowing one to jump to the containing folder on one's desktop.

Possible Todos:

1. Integrate or replace built-in desktop browser in a better way: Utilize info at http://stackoverflow.com/questions/18312461/code-responsible-for-browsing-firefoxs-desktop  - also posted at http://forums.mozillazine.org/viewtopic.php?f=19&t=2740643 ? ;
1. Incorporate [WebAppFind](https://github.com/brettz9/webappfind) functionality upon right-click.
1. Allow (power) sticky notes to be associated (as hidden files within the directory) to be displayed as an overlay when browsing files (as with a browser add-on and hopefully for a browser-in-browser)
1. Integrate with "Desktop" FF addon if his were to use iframes
1. Add right-click features, working with WebAppFind where possible for greater type-aware possibilities (e.g., when creating a file, one could create a bare file of the desired type)
    1. Allow opening of file (rather than FF's download), alias?, or directory;
    1. Allow creation of file, directory or alias (to file or directory) or zip
    1. Allow renaming of a file, directory or alias
    1. Allow deleting of a file, directory or alias
    1. Ideally allow copy or cut-and-paste of files/directories (and drag-and-drop for relevant viewing modes)
    1. Support open Git GUI/bash/create repo here, edit in Notepad++, etc., open with, send to, properties, folder permissions
1. Allow additional options for opening or editing file in web app (e.g., saving hard-coded web apps for a given file), working with [WebAppFind](https://github.com/brettz9/webappfind) and [ExecuteBuilder](https://builder.addons.mozilla.org/package/204099/latest/) (once the latter is complete)
1. Display file/folder icons
1. Add meta-data columns (at least "permissions" appears available)
1. Add file search (through js-ctypes?)
1. Ensure reading files in file browser with new Node-friendly API so can also reuse code on server or even for HTML Ajax browsing of file sources?)
1. Re: feature for addon bar icon revealing path of a loaded file, have options to map websites this way also, esp. 127.0.0.1/localhost ; have option to automatically handle click-to-expose-path if loaded through webappfind (since we know where the path originated)
1. Ability to handle multiple files on right-click (unlike what seems readily possibly in Windows through Open With... mechanism)
