import { fileIcons } from "./mit-file-icons";
import { folderIcons } from "./mit-folder-icons";
import { FSDescriptor } from './filemanager.component';

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

export const resolveIcon = (file: FSDescriptor) => {

    // const mimeType = MimeTypeBase[ext];
    // MimeTypes[ext] ||
    // .includes(MimeTypeBase[ext])
    // ? MimeTypeBase[ext] 
    // || "application-x-generic";
    // if (mimeType)
    //     return `icons/mimetypes/${mimeType}.svg`;


    
    // VS Code Material Icon Theme pack
    if (file.kind == "directory") {
        const dirnameMatch = getBestMatch(dirnames, file.name);
        return dirnameMatch ? `lib/mit/${dirnameMatch}.svg` : "lib/mit/folder-app.svg";
    }
    const filenameMatch = getBestMatch(filenames, file.name);
    const extMatch = getBestMatch(exts, file.name);

    return filenameMatch ? `lib/mit/${filenameMatch}.svg` : 
        extMatch ? `lib/mit/${extMatch}.svg` :
        "lib/mit/file.svg";
}