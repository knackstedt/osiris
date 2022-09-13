import { fileIcons } from "./mit-file-icons";
import { folderIcons } from "./mit-folder-icons";

// Build maps of extension/filename => icon id.
const exts = [];
const filenames = [];
const dirnames = [];
fileIcons.icons.forEach(i => {
    i.fileNames?.forEach(name => {
        filenames.push({
            val: name, 
            iconName: i.name
        });
    })
    i.fileExtensions?.forEach(ext => {
        exts.push({
            val: ext, 
            iconName: i.name
        });
    })
});
folderIcons.find(f => f.name == "specific").icons.forEach(dir => {
    dir.folderNames.forEach(fn => {
        dirnames.push({
            val: fn, 
            iconName: dir.name
        });
    })
});

const getBestMatch = (data: {val: string, iconName: string}[], filename) => {
    return data
        .filter(d => filename.endsWith(d.val)) // filter to all match results
        .sort((a, b) => b.val.length - a.val.length) // sort longest string first
        [0]?.iconName; // Return the first result.
}

export const resolveIcon = (file: string) => {

    // const mimeType = MimeTypeBase[ext];
    // MimeTypes[ext] ||
    // .includes(MimeTypeBase[ext])
    // ? MimeTypeBase[ext] 
    // || "application-x-generic";
    // if (mimeType)
    //     return `assets/icons/mimetypes/${mimeType}.svg`;


    
    // VS Code Material Icon Theme pack
    if (file.endsWith('/')) {
        const dirnameMatch = getBestMatch(dirnames, file);
        return dirnameMatch ? `assets/lib/mit/${dirnameMatch}.svg` : "assets/lib/mit/folder-app.svg";
    }
    const filenameMatch = getBestMatch(filenames, file);
    const extMatch = getBestMatch(exts, file);

    return filenameMatch ? `assets/lib/mit/${filenameMatch}.svg` : 
        extMatch ? `assets/lib/mit/${extMatch}.svg` :
        "assets/lib/mit/file.svg";
}